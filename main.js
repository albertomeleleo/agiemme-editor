const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In development mode, load from Vite dev server
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers per le operazioni sui file

// Seleziona una directory
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
});

// Leggi il contenuto di una directory
ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);

        return {
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          isFile: entry.isFile(),
          extension: path.extname(entry.name),
          modifiedTime: stats.mtime,
        };
      })
    );

    // Ordina: directory prima, poi file
    return items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Error reading directory:', error);
    throw error;
  }
});

// Leggi il contenuto di un file
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
});

// Salva il contenuto in un file
ipcMain.handle('save-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
});

// Crea un nuovo file
ipcMain.handle('create-file', async (event, dirPath, fileName) => {
  try {
    const filePath = path.join(dirPath, fileName);

    // Verifica se il file esiste già
    try {
      await fs.access(filePath);
      throw new Error('File already exists');
    } catch (err) {
      // Il file non esiste, procediamo
      if (err.code !== 'ENOENT') throw err;
    }

    await fs.writeFile(filePath, '', 'utf-8');
    return filePath;
  } catch (error) {
    console.error('Error creating file:', error);
    throw error;
  }
});

// Salva file come (con dialog)
ipcMain.handle('save-file-as', async (event, content, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'untitled.md',
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'mmd'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (result.canceled) {
    return null;
  }

  try {
    await fs.writeFile(result.filePath, content, 'utf-8');
    return result.filePath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
});
