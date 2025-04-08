const { app, BrowserWindow, protocol, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window with appropriate settings
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // For security reasons
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'generated-icon.png'),
    title: 'FastDummyTicket'
  });

  // Determine the URL to load
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: 'localhost:3000',
    protocol: 'http:',
    slashes: true
  });

  // Load the app
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove the default menu bar
  mainWindow.setMenuBarVisibility(false);
}

// Create the window when Electron is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, recreate a window if dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process code
// You can also separate them into files and require them here.

// Set up IPC communication
ipcMain.on('toMain', (event, data) => {
  console.log('Received from renderer:', data);
  
  // Handle window control actions
  if (data.action === 'minimize' && mainWindow) {
    mainWindow.minimize();
  } else if (data.action === 'maximize' && mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  } else if (data.action === 'close' && mainWindow) {
    mainWindow.close();
  } else if (data.action === 'renderer-ready' && mainWindow) {
    // Inform the renderer that the app is ready
    mainWindow.webContents.send('fromMain', { type: 'app-ready' });
  }
});