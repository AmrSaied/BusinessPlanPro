// This script starts Electron with our application
// Usage: node electron-start.js

const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

// Start the Electron app
console.log('Starting Electron application...');

const electronProcess = spawn(electron, [path.join(__dirname, 'electron.js')], {
  stdio: 'inherit'
});

electronProcess.on('close', (code) => {
  console.log(`Electron application exited with code ${code}`);
  process.exit(code);
});