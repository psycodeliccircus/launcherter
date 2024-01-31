// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getVersion: () => {
        // Use a API remote do Electron para acessar a versão do package.json
        const { remote } = require('electron');
        const app = remote.app;
        return app.getVersion();
    },
    send: (channel, data) => {
        // Envia uma mensagem para o processo principal
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        // Registra um ouvinte para mensagens do processo principal
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
});
