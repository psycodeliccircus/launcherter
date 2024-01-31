// preload.js

const { contextBridge, ipcRenderer, shell } = require('electron');

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
