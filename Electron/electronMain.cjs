// Electron main process
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Window state management
let windowStateKeeper;
try {
  windowStateKeeper = require('electron-window-state');
} catch (err) {
  console.warn('[Electron] electron-window-state not available:', err && err.message);
  windowStateKeeper = null;
}

// Get the project root directory (one level up from Electron)
const projectRoot = path.join(__dirname, '..');

/**
 * Creates the main application window
 */
function createWindow() {
  // Load the previous window state with fallback to defaults
  let mainWindowState = windowStateKeeper
    ? windowStateKeeper({ defaultWidth: 1280, defaultHeight: 720 })
    : { x: undefined, y: undefined, width: 1280, height: 720, manage: () => {} };

  const mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#ffffff'
  });

  // Hide menu bar for cleaner interface
  mainWindow.setMenuBarVisibility(false);
  
  // Load the main HTML file from project root
  mainWindow.loadFile(path.join(projectRoot, 'index.html'));

  // Let windowStateKeeper manage window state if available
  if (windowStateKeeper && typeof mainWindowState.manage === 'function') {
    mainWindowState.manage(mainWindow);
  }
}

// Initialize application when Electron is ready
app.whenReady().then(() => {
  // Set the working directory to the project root
  process.chdir(projectRoot);

  // Create the main window
  createWindow();

  // Handle macOS window activation
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
