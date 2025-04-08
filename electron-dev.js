// This script starts both the server and Electron for development
// Usage: node electron-dev.js

const { spawn } = require('child_process');
const waitOn = require('wait-on');
const electron = require('electron');
const path = require('path');

// Start the server first
console.log('Starting the server...');
const serverProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    ELECTRON_START_URL: 'http://localhost:3000'
  }
});

// Wait for the server to be available
waitOn({
  resources: ['http://localhost:3000'],
  timeout: 30000 // 30 seconds timeout
}).then(() => {
  console.log('Server is ready. Starting Electron application...');
  
  // Start Electron
  const electronProcess = spawn(electron, [path.join(__dirname, 'electron.js')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_START_URL: 'http://localhost:3000',
      NODE_ENV: 'development'
    }
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron application exited with code ${code}`);
    serverProcess.kill(); // Kill the server when Electron is closed
    process.exit(code);
  });
}).catch((err) => {
  console.error('Error waiting for server:', err);
  serverProcess.kill();
  process.exit(1);
});

// Handle termination signals
const cleanup = () => {
  serverProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);