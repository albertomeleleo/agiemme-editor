import React, { useState, useEffect } from 'react';
import './FileExplorer.css';

const FileExplorer = ({ onFileSelect, currentFilePath }) => {
  const [rootPath, setRootPath] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [items, setItems] = useState([]);
  const [pathHistory, setPathHistory] = useState([]);

  const selectDirectory = async () => {
    const dirPath = await window.electronAPI.selectDirectory();
    if (dirPath) {
      setRootPath(dirPath);
      setCurrentPath(dirPath);
      setPathHistory([dirPath]);
      loadDirectory(dirPath);
    }
  };

  const loadDirectory = async (dirPath) => {
    try {
      const dirItems = await window.electronAPI.readDirectory(dirPath);
      // Filtra solo file .md, .mmd e directory
      const filtered = dirItems.filter(
        (item) =>
          item.isDirectory ||
          item.extension === '.md' ||
          item.extension === '.mmd'||
          item.extension === '.mermaid'
      );
      setItems(filtered);
    } catch (error) {
      console.error('Error loading directory:', error);
    }
  };

  const handleItemClick = async (item) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
      setPathHistory([...pathHistory, item.path]);
      loadDirectory(item.path);
    } else {
      onFileSelect(item.path);
    }
  };

  const goBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      const previousPath = newHistory[newHistory.length - 1];
      setPathHistory(newHistory);
      setCurrentPath(previousPath);
      loadDirectory(previousPath);
    }
  };

  const getRelativePath = (fullPath) => {
    if (!rootPath || !fullPath) return fullPath;
    return fullPath.replace(rootPath, '') || '/';
  };

  const handleNewFile = async () => {
    if (!currentPath) return;

    const fileName = prompt('Nome del nuovo file (es: documento.md):');
    if (!fileName) return;

    // Assicurati che abbia l'estensione corretta
    let finalFileName = fileName;
    if (!fileName.endsWith('.md') && !fileName.endsWith('.mmd')) {
      finalFileName = fileName + '.md';
    }

    try {
      const filePath = await window.electronAPI.createFile(currentPath, finalFileName);
      loadDirectory(currentPath);
      onFileSelect(filePath);
    } catch (error) {
      alert('Errore nella creazione del file: ' + error.message);
    }
  };

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3>File Explorer</h3>
        {!rootPath && (
          <button onClick={selectDirectory} className="btn-primary">
            Seleziona Directory
          </button>
        )}
      </div>

      {rootPath && (
        <>
          <div className="current-path">
            <button
              onClick={goBack}
              disabled={pathHistory.length <= 1}
              className="btn-back"
              title="Indietro"
            >
              ←
            </button>
            <span className="path-text" title={currentPath}>
              {getRelativePath(currentPath)}
            </span>
          </div>

          <div className="explorer-actions">
            <button onClick={handleNewFile} className="btn-secondary">
              + Nuovo File
            </button>
            <button onClick={selectDirectory} className="btn-secondary">
              Cambia Directory
            </button>
          </div>

          <div className="file-list">
            {items.length === 0 ? (
              <div className="empty-message">
                Nessun file .md o .mmd trovato
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.path}
                  className={`file-item ${
                    item.path === currentFilePath ? 'active' : ''
                  }`}
                  onClick={() => handleItemClick(item)}
                  title={item.path}
                >
                  <span className="file-icon">
                    {item.isDirectory ? '📁' : '📄'}
                  </span>
                  <span className="file-name">{item.name}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FileExplorer;
