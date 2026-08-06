const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

function createWindow() {
  const smokeTest = process.argv.includes('--smoke-test');
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: '#07100d',
    title: 'Roster Pilot',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once('ready-to-show', () => {
    if (!smokeTest) window.show();
  });
  window.webContents.once('did-finish-load', async () => {
    if (!smokeTest) return;
    try {
      const state = await window.webContents.executeJavaScript(`({
        title: document.title,
        text: document.body.innerText,
        stylesheets: document.styleSheets.length
      })`);
      const passed = state.title === 'Roster Pilot'
        && state.text.includes('Recommended pilots')
        && state.stylesheets > 0;
      console.log(`${passed ? 'SMOKE_OK' : 'SMOKE_FAIL'} ${JSON.stringify(state)}`);
      app.exit(passed ? 0 : 1);
    } catch (error) {
      console.error('SMOKE_FAIL', error);
      app.exit(1);
    }
  });
  window.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error(`LOAD_FAILED ${code} ${description} ${url}`);
    if (smokeTest) app.exit(1);
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });

  const developmentUrl = process.env.ROSTER_PILOT_DEV_URL;
  if (developmentUrl) {
    void window.loadURL(developmentUrl);
  } else {
    void window.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
