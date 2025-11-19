import React, { useState, useEffect } from 'react';
import { VscFolder, VscFolderOpened, VscFile, VscNewFile, VscRefresh } from 'react-icons/vsc';
import NewFileModal from './NewFileModal';
import './FileExplorer.css';

const FileExplorer = ({ onFileSelect, currentFilePath }) => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);

  useEffect(() => {
    if (currentPath) {
      loadDirectory(currentPath);
    }
  }, [currentPath]);

  const loadDirectory = async (path) => {
    try {
      const result = await window.electronAPI.readDirectory(path);
      if (Array.isArray(result)) {
        const filteredFiles = result.filter(file => {
          if (file.isDirectory) return true;
          const ext = file.extension ? file.extension.toLowerCase() : '';
          return ['.md', '.mmd', '.mermaid'].includes(ext);
        });
        setFiles(filteredFiles);
        setCurrentPath(path);
      } else {
        console.error('Unexpected result from readDirectory:', result);
        setFiles([]);
      }
    } catch (error) {
      console.error('Error reading directory:', error);
      setFiles([]);
    }
  };

  const handleDirectorySelect = async () => {
    const path = await window.electronAPI.selectDirectory();
    if (path) {
      setCurrentPath(path);
    }
  };

  const handleItemClick = (file) => {
    if (file.isDirectory) {
      loadDirectory(file.path);
    } else {
      onFileSelect(file.path);
    }
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    // Simple way to go up one level
    // Handle Windows and Unix paths
    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parentPath = currentPath.split(separator).slice(0, -1).join(separator) || separator;
    loadDirectory(parentPath);
  };

  const openNewFileModal = () => {
    if (!currentPath) {
      alert('Seleziona una cartella prima di creare un file.');
      return;
    }
    setShowNewFileModal(true);
  };

  const handleCreateFile = async (fileName) => {
    if (!fileName) return;

    try {
      const success = await window.electronAPI.createFile(currentPath, fileName);
      if (success) {
        loadDirectory(currentPath); // Refresh list
        // Optionally open the new file
        const separator = currentPath.includes('\\') ? '\\' : '/';
        onFileSelect(`${currentPath}${separator}${fileName}`);
      } else {
        alert('Impossibile creare il file (forse esiste già?)');
      }
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Errore nella creazione del file: ' + error.message);
    }
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <button onClick={handleDirectorySelect} title="Apri Cartella">
          <VscFolderOpened />
        </button>
        <button onClick={() => loadDirectory(currentPath)} title="Aggiorna" disabled={!currentPath}>
          <VscRefresh />
        </button>
        <button onClick={openNewFileModal} title="Nuovo File" disabled={!currentPath}>
          <VscNewFile />
        </button>
      </div>
      <div className="current-path" title={currentPath}>
        {currentPath ? (currentPath.split(/[/\\]/).pop() || currentPath) : 'Nessuna cartella'}
      </div>
      <div className="file-list">
        {currentPath && (
          <div className="file-item directory" onClick={handleGoUp}>
            <span className="file-icon"><VscFolderOpened /></span>
            <span className="file-name-text">..</span>
          </div>
        )}
        {files.map((file, index) => (
          <div
            key={index}
            className={`file-item ${file.isDirectory ? 'directory' : 'file'} ${currentFilePath === file.path ? 'active' : ''}`}
            onClick={() => handleItemClick(file)}
          >
            <span className="file-icon">
              {file.isDirectory ? <VscFolder /> : <VscFile />}
            </span>
            <span className="file-name-text">{file.name}</span>
          </div>
        ))}
        {currentPath && files.length === 0 && (
          <div className="empty-folder-message">Cartella vuota</div>
        )}
      </div>

      <NewFileModal
        isOpen={showNewFileModal}
        onClose={() => setShowNewFileModal(false)}
        onCreate={handleCreateFile}
      />
    </div>
  );
};

export default FileExplorer;
