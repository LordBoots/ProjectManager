// Electron main process
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
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
      contextIsolation: false,
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

const PEER_IDENTITY_FILE = 'pm-suggestions-peer-identity.json';

function peerIdentityPath() {
  return path.join(app.getPath('userData'), PEER_IDENTITY_FILE);
}

function registerPeerIdentityIpc() {
  ipcMain.handle('pm-get-peer-identity', () => {
    try {
      const p = peerIdentityPath();
      if (!fs.existsSync(p)) return { peerId: null };
      const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
      const peerId = typeof raw.peerId === 'string' && raw.peerId.trim() ? raw.peerId.trim() : null;
      return { peerId };
    } catch {
      return { peerId: null };
    }
  });

  ipcMain.handle('pm-set-peer-identity', (event, id) => {
    const peerId = typeof id === 'string' && id.trim() ? id.trim() : '';
    if (!peerId) return false;
    try {
      const p = peerIdentityPath();
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify({ peerId }, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('[Electron] pm-set-peer-identity', e);
      return false;
    }
  });
}

// Initialize application when Electron is ready
app.whenReady().then(() => {
  registerPeerIdentityIpc();

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
