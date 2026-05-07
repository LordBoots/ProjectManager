// Preload script - exposes Node.js helpers to the renderer process
const fs = require('fs');
const path = require('path');

// Since contextIsolation is false, attach directly to window
window.electronAPI = {
  // File system operations
  readFile: (filePath) => {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  },

  writeFile: (filePath, data) => {
    try {
      fs.writeFileSync(filePath, data, 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  },

  exists: (filePath) => {
    return fs.existsSync(filePath);
  },

  readdir: (dirPath) => {
    try {
      return fs.readdirSync(dirPath);
    } catch (error) {
      console.error('Error reading directory:', error);
      throw error;
    }
  },

  stat: (filePath) => {
    try {
      return fs.statSync(filePath);
    } catch (error) {
      console.error('Error getting file stats:', error);
      throw error;
    }
  },

  // Path utilities
  joinPath: (...paths) => {
    return path.join(...paths);
  },

  getProjectRoot: () => {
    return path.join(__dirname, '..');
  },

  // JSON helpers
  readJSON: (filePath) => {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading JSON file:', error);
      throw error;
    }
  },

  writeJSON: (filePath, data) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing JSON file:', error);
      throw error;
    }
  }
};
