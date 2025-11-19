const { contextBridge, ipcRenderer } = require('electron');

// Espone API sicure al processo di rendering
contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  createFile: (dirPath, fileName) => ipcRenderer.invoke('create-file', dirPath, fileName),
  saveFileAs: (content, defaultName) => ipcRenderer.invoke('save-file-as', content, defaultName),
});
