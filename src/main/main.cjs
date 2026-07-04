const path = require('node:path');
const { app, BrowserWindow } = require('electron');

const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    webPreferences: {
      preload: path.resolve(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  const developmentUrl = process.env.VITE_DEV_SERVER_URL;

  if (developmentUrl) {
    void mainWindow.loadURL(developmentUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    return;
  }

  const rendererEntry = path.resolve(__dirname, '../../dist/renderer/index.html');
  void mainWindow.loadFile(rendererEntry);
};

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
