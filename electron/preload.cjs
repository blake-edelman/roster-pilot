const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('rosterPilot', {
  platform: process.platform,
  desktop: true,
});

