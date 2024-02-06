// preload.js

const { contextBridge, ipcRenderer, shell, nativeImage, nativeTheme } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('api', {
    getVersion: () => {
        const { remote } = require('electron');
        const app = remote.app;
        return app.getVersion();
    },
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    openExternalLink: (url) => {
        shell.openExternal(url);
    },
    overrideWindowOpen: () => {
        window.open = (url, target, features) => {
            if (target === '_blank') {
                shell.openExternal(url);
            } else {
                const newWindow = window.open(url, target, features);
                return newWindow;
            }
        };
    }
});

const { Titlebar } = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
  // Title bar implementation
  const options = {
    // options
    backgroundColor: 'var(--color-background)',
    overflow: 'auto',
    icon: nativeImage.createFromPath(path.join(__dirname, 'public/icon.png')),
    titleHorizontalAlignment: 'center',
    minimizable: true,
    maximizable: true,
    closeable: true,
    svgcolor: 'var(--color-dark)',
    tooltips: {
      minimize: 'Minimizar',
      maximize: 'Maximizar',
      restoreDown: 'Restaurar',
      close: 'Fechar'
    }
  };
  
  new Titlebar(options);
});