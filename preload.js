const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// specific IPC channels. These are secure gateways to main process functionality.
contextBridge.exposeInMainWorld(
  'electron', 
  {
    // Send message to the main process
    send: (channel, data) => {
      // Whitelist channels
      let validChannels = ['toMain'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    // Receive message from the main process
    receive: (channel, func) => {
      let validChannels = ['fromMain'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    // Any other app-specific desktop functionality can be added here
    platform: process.platform
  }
);