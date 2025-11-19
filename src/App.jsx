import React, { useState, useEffect, useCallback, useRef } from 'react';
import FileExplorer from './components/FileExplorer';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toast from './components/Toast';
import SnippetLibrary from './components/SnippetLibrary';
import TabBar from './components/TabBar';
import './App.css';

function App() {
  // State for multi-tab
  const [files, setFiles] = useState([]); // Array of { path, content, isDirty }
  const [activeFilePath, setActiveFilePath] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [toasts, setToasts] = useState([]);
  const autoSaveTimerRef = useRef(null);

  // Derived state for active file
  const activeFile = files.find(f => f.path === activeFilePath);
  const content = activeFile ? activeFile.content : '';
  const hasUnsavedChanges = activeFile ? activeFile.isDirty : false;

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Carica il file selezionato (apre in nuovo tab o switcha a esistente)
  const handleFileSelect = async (filePath) => {
    // Se il file è già aperto, switcha a quel tab
    if (files.some(f => f.path === filePath)) {
      setActiveFilePath(filePath);
      return;
    }

    try {
      const fileContent = await window.electronAPI.readFile(filePath);
      const newFile = {
        path: filePath,
        content: fileContent,
        isDirty: false
      };

      setFiles(prev => [...prev, newFile]);
      setActiveFilePath(filePath);
      setIsEditMode(false); // Default view mode for new files
    } catch (error) {
      addToast('Errore nel caricamento del file: ' + error.message, 'error');
    }
  };

  // Chiude un tab
  const handleTabClose = async (filePath) => {
    const fileToClose = files.find(f => f.path === filePath);

    if (fileToClose.isDirty) {
      const confirmed = window.confirm(
        `Il file ${filePath.split('/').pop()} ha modifiche non salvate. Vuoi chiuderlo senza salvare?`
      );
      if (!confirmed) return;
    }

    const newFiles = files.filter(f => f.path !== filePath);
    setFiles(newFiles);

    if (activeFilePath === filePath) {
      // Se abbiamo chiuso il tab attivo, attiviamo l'ultimo disponibile o null
      if (newFiles.length > 0) {
        setActiveFilePath(newFiles[newFiles.length - 1].path);
      } else {
        setActiveFilePath(null);
      }
    }
  };

  // Gestisce le modifiche nell'editor per il file attivo
  const handleContentChange = (newContent) => {
    if (!activeFilePath) return;

    setFiles(prev => prev.map(f => {
      if (f.path === activeFilePath) {
        return { ...f, content: newContent, isDirty: true };
      }
      return f;
    }));
  };

  // Inserisce uno snippet nel contenuto
  const handleSnippetInsert = (snippetCode) => {
    if (!activeFilePath) return;

    const newContent = content + (content ? '\n' : '') + snippetCode;
    handleContentChange(newContent);
    addToast('Snippet inserito', 'info');
  };

  // Salva il file corrente
  const handleSave = async (silent = false) => {
    if (!activeFilePath) {
      if (!silent) await handleSaveAs();
      return;
    }

    setIsSaving(true);
    try {
      await window.electronAPI.saveFile(activeFilePath, content);

      setFiles(prev => prev.map(f => {
        if (f.path === activeFilePath) {
          return { ...f, isDirty: false };
        }
        return f;
      }));

      if (!silent) addToast('File salvato con successo!', 'success');
    } catch (error) {
      addToast('Errore nel salvataggio del file: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && activeFilePath && !isSaving) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [content, autoSaveEnabled, hasUnsavedChanges, activeFilePath]);

  // Salva come nuovo file
  const handleSaveAs = async () => {
    setIsSaving(true);
    try {
      const currentFileName = activeFilePath ? activeFilePath.split('/').pop() : 'untitled.md';
      const filePath = await window.electronAPI.saveFileAs(content, currentFileName);

      if (filePath) {
        // Se stiamo salvando un file esistente con nuovo nome, o un nuovo file
        // Aggiorniamo il tab corrente o ne creiamo uno nuovo?
        // Solitamente "Save As" sostituisce il file corrente nell'editor

        const newFile = {
          path: filePath,
          content: content,
          isDirty: false
        };

        if (activeFilePath) {
          // Sostituisci il file corrente
          setFiles(prev => prev.map(f => f.path === activeFilePath ? newFile : f));
        } else {
          // Aggiungi nuovo file (caso non dovrebbe succedere spesso con la logica attuale)
          setFiles(prev => [...prev, newFile]);
        }

        setActiveFilePath(filePath);
        addToast('File salvato con successo!', 'success');
      }
    } catch (error) {
      addToast('Errore nel salvataggio del file: ' + error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle tra modalità view e edit
  const toggleEditMode = () => {
    // Non serve più il check di unsaved changes per switchare mode, 
    // dato che lo stato è preservato nel tab
    setIsEditMode(!isEditMode);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Salva preferenza theme in localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S o Cmd+S per salvare
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditMode && activeFilePath) {
          handleSave();
        }
      }
      // Ctrl+Shift+S o Cmd+Shift+S per salvare come
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        if (isEditMode && activeFilePath) {
          handleSaveAs();
        }
      }
      // Ctrl+E o Cmd+E per toggle edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (activeFilePath) {
          toggleEditMode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFilePath, content, hasUnsavedChanges, isEditMode]);

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <h1>AGiEmme Editor</h1>
        <div className="header-actions">
          <div className="header-controls">
            <label className="auto-save-toggle" title="Salvataggio Automatico">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
              />
              <span>Auto-Save</span>
            </label>

            <button
              onClick={toggleDarkMode}
              className="btn-theme"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {activeFilePath && (
            <button
              onClick={toggleEditMode}
              className={isEditMode ? 'btn-mode active' : 'btn-mode'}
              title="Modalità Edit (Ctrl+E)"
            >
              {isEditMode ? '📝 Modalità Edit' : '👁️ Modalità View'}
            </button>
          )}

          {isEditMode && activeFilePath && (
            <button
              onClick={() => setShowSnippets(!showSnippets)}
              className={`btn-mode ${showSnippets ? 'active' : ''}`}
              title="Mostra/Nascondi Snippets"
            >
              🧩 Snippets
            </button>
          )}

          {isEditMode && activeFilePath && (
            <>
              <button
                onClick={() => handleSave(false)}
                disabled={!activeFilePath || isSaving}
                className="btn-primary"
                title="Salva (Ctrl+S)"
              >
                {isSaving ? 'Salvataggio...' : 'Salva'}
              </button>
              <button
                onClick={handleSaveAs}
                disabled={!activeFilePath || isSaving}
                className="btn-secondary"
                title="Salva come (Ctrl+Shift+S)"
              >
                {isSaving ? '...' : 'Salva come...'}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="app-content">
        <FileExplorer
          onFileSelect={handleFileSelect}
          currentFilePath={activeFilePath}
        />

        <div className="main-area">
          {files.length > 0 ? (
            <>
              <TabBar
                files={files}
                activeFile={activeFilePath}
                onTabSelect={setActiveFilePath}
                onTabClose={handleTabClose}
              />
              <div className={`editor-preview-container ${isEditMode ? 'edit-mode' : 'view-mode'}`}>
                {isEditMode && <Editor content={content} onChange={handleContentChange} />}
                <Preview content={content} />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-content">
                <h2>Benvenuto in AGiEmme Editor</h2>
                <p>Seleziona un file dalla barra laterale per iniziare</p>
                <div className="shortcuts-info">
                  <p>Shortcuts:</p>
                  <ul>
                    <li><strong>Ctrl+E</strong>: Toggle Edit/View Mode</li>
                    <li><strong>Ctrl+S</strong>: Salva</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {isEditMode && showSnippets && activeFilePath && (
          <SnippetLibrary onInsert={handleSnippetInsert} />
        )}
      </div>

      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
