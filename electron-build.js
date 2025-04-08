// This script builds the application and packages it using electron-builder
// Usage: node electron-build.js

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const electronBuilder = require('electron-builder');

// First, build the React application
console.log('Building the React application...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Build process exited with code ${code}`);
    process.exit(code);
  }

  console.log('React application built successfully. Packaging with electron-builder...');
  
  // Once the build is complete, package with electron-builder
  electronBuilder.build({
    config: require('./electron-builder.json')
  })
  .then(() => {
    console.log('Packaging complete! Your application is in the electron-dist folder.');
  })
  .catch((error) => {
    console.error('Error during packaging:', error);
    process.exit(1);
  });
});

// Handle termination signals
const cleanup = () => {
  buildProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);