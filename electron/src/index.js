const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

(async () => {
    await app.whenReady();

    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            preload: __dirname + '/preload.js'
        }
    });

    // await mainWindow.loadURL(`file://${__dirname}/../../dist/index.html`);
    await mainWindow.loadURL('http://localhost:5050');
})();