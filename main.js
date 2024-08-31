const { app, BrowserWindow, ipcMain, Tray, nativeImage, dialog, shell, Menu, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const { setupTitlebar, attachTitlebarToWindow } = require('custom-electron-titlebar/main');

setupTitlebar();

const iconPath = path.join(__dirname, 'build/icon.png');
const appVersion = require('./package.json').version;
const exampleMenuTemplate = [
  {
    label: 'Launcher TEB v' + app.getVersion(),
    submenu: [
      { label: 'Recarregar', role: 'reload' },
      { label: 'Forçar Recarregamento', role: 'forceReload' },
      { type: 'separator' },
      { label: 'Zoom In', role: 'zoomIn' },
      { label: 'Zoom Out', role: 'zoomOut' },
      { label: 'Redefinir Zoom', role: 'resetZoom' },
      { type: 'separator' },
      { label: 'Sair', click: () => app.quit() }
    ]
  },
  {
    label: '&Rede Sociais',
    submenu: [
      { label: 'Youtube', click: () => shell.openExternal('https://youtube.com/renildomarcio') },
      { type: 'separator' },
      { label: 'Comunidade Trilhas Elite Brasil', click: () => shell.openExternal('https://renildomarcio.com.br/pages/trilhaselite') },
      { label: 'Grupo Trilhas Elite Brasil', click: () => shell.openExternal('https://renildomarcio.com.br/groups/trilhaselite') },
      { type: 'separator' }
    ]
  },
  {
    label: '&Update',
    submenu: [
      { label: 'Verificar Update', click: () => autoUpdater.checkForUpdates() }
    ]
  }
];

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    icon: iconPath,
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  const menu = Menu.buildFromTemplate(exampleMenuTemplate);
  Menu.setApplicationMenu(menu);

  autoUpdater.checkForUpdates();
  mainWindow.maximize();
  mainWindow.loadFile(path.join(__dirname, 'public/loading.html'));

  const wc = mainWindow.webContents;

  wc.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  wc.once('did-finish-load', () => {
    setTimeout(() => {
      mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
    }, 10000);
  });

  wc.on('did-fail-provisional-load', () => {
    mainWindow.loadFile(path.join(__dirname, 'public/offline.html'));
  });

  attachTitlebarToWindow(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Função para iniciar o download
global.startDownload = function (fileName, savePath) {
  const baseUrl = 'https://api.renildomarcio.com.br/ets2/mapa/';
  const fileUrl = `${baseUrl}${fileName}`;
  const filePath = path.join(savePath, fileName);

  if (!fs.existsSync(savePath)) {
    fs.mkdirSync(savePath, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  const downloadFile = fs.createWriteStream(filePath);

  https.get(fileUrl, (response) => {
    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;
    let lastDownloadedSize = 0;
    let startTime = Date.now();

    response.on('data', (chunk) => {
      downloadedSize += chunk.length;

      const progressData = {
        fileName,
        downloadedSize,
        totalSize,
        speed: (downloadedSize - lastDownloadedSize) / (Date.now() - startTime) * 1000,
        percentage: (downloadedSize / totalSize) * 100,
      };

      mainWindow.webContents.send('downloadProgress', progressData);

      lastDownloadedSize = downloadedSize;
    });

    response.pipe(downloadFile);

    response.on('end', () => {
      console.log(`Download concluído para ${fileName}`);
      mainWindow.webContents.send('downloadCompleted', { fileName });
    });
  }).on('error', (error) => {
    console.error(`Erro no download de ${fileName}: ${error.message}`);
  });
};

// Manipulador IPC para iniciar o download com seleção de diretório
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.on('startDownload', async (event, fileName) => {
  const selectedDirectory = await dialog.showOpenDialog({ properties: ['openDirectory'] });

  if (selectedDirectory.canceled || !selectedDirectory.filePaths.length) {
    console.log('Seleção de diretório cancelada');
    return;
  }

  const savePath = selectedDirectory.filePaths[0];
  startDownload(fileName, savePath);
});

// Manipuladores de atualização
function handleUpdateChecking() {
  log.log('Checking for updates.');
}

function handleUpdateAvailable(info) {
  log.log('Update available.');
}

function handleDownloadProgress(progressObj) {
  const message = `Downloading update. Speed: ${progressObj.bytesPerSecond} - ${~~progressObj.percent}% [${progressObj.transferred}/${progressObj.total}]`;
  log.log(message);

  const swalMessage = `Swal.fire({
    title: 'Baixando atualização',
    html: '${message}',
    allowOutsideClick: false,
    onBeforeOpen: () => Swal.showLoading()
  });`;

  mainWindow.webContents.executeJavaScript(swalMessage);
}

function handleUpdateError(err) {
  log.log(`Update check failed: ${err.toString()}`);
}

function handleUpdateNotAvailable(info) {
  log.log(`Não há atualizações disponíveis para o launcher.`);
}

function handleUpdateDownloaded(info) {
  const swalMessage = `Swal.fire({
    title: 'Reiniciando o aplicativo',
    html: 'Aguente firme, reiniciando o aplicativo para atualização!',
    allowOutsideClick: false,
    onBeforeOpen: () => Swal.showLoading()
  });`;

  mainWindow.webContents.executeJavaScript(swalMessage);
  autoUpdater.quitAndInstall();
}

autoUpdater.on('checking-for-update', handleUpdateChecking);
autoUpdater.on('update-available', handleUpdateAvailable);
autoUpdater.on('download-progress', handleDownloadProgress);
autoUpdater.on('error', handleUpdateError);
autoUpdater.on('update-not-available', handleUpdateNotAvailable);
autoUpdater.on('update-downloaded', handleUpdateDownloaded);
