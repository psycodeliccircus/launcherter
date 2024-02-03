const { app, BrowserWindow, ipcMain, Tray, nativeImage, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1280,
    minHeight: 800,
    icon: "build/icon.ico",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  autoUpdater.checkForUpdates();

  mainWindow.maximize();

  // Carregar a tela de carregamento inicial
  mainWindow.loadFile(path.join(__dirname, 'public/loading.html'));

  // Criar webContents
  let wc = mainWindow.webContents;

  // Intercept links with "http" or "https" protocol and open in the default browser
  wc.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);

    // Check if the link is external (with "http" or "https" protocol)
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
  
  // Quando a página de carregamento inicial é totalmente carregada
  wc.once('did-finish-load', () => {
    // Aguardar 10 segundos antes de redirecionar para home.html
    setTimeout(() => {
      mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
    }, 10000);
  });

  // Se houver falha no carregamento, redirecionar para a página offline.html
  wc.on('did-fail-provisional-load', (error, code) => {
    mainWindow.loadFile(path.join(__dirname, 'public/offline.html'));
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Função para iniciar o download
global.startDownload = function (fileName) {
  const baseUrl = 'https://api.renildomarcio.com.br/ets2/mapa/';
  const fileUrl = `${baseUrl}${fileName}`;
  const modFolderPath = path.join(os.homedir(), 'Documents', 'Euro Truck Simulator 2', 'mod');
  const filePath = path.join(modFolderPath, fileName);

  // Cria o diretório se não existir
  if (!fs.existsSync(modFolderPath)) {
    fs.mkdirSync(modFolderPath, { recursive: true });
  }

  // Remove o arquivo existente, se houver
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
      // Adicione qualquer lógica adicional após o término do download, se necessário.
    });
  }).on('error', (error) => {
    console.error(`Erro no download de ${fileName}: ${error.message}`);
  });
};

// Inicia o download quando receber o evento 'startDownload' do renderer
ipcMain.on('startDownload', (event, fileName) => {
  startDownload(fileName);
});

// Funções de tratamento de atualizações
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
      onBeforeOpen: () => {
          Swal.showLoading();
      }
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
      onBeforeOpen: () => {
          Swal.showLoading();
      }
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
