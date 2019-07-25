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
    let dev_path = 'key://pairio/spikeforest/test_franklab.json';
    //let dev_path = 'sha1://c5ad0ae29162d170c751eb44be1772f70360f826/analysis.json';
    await mainWindow.loadURL(`http://localhost:5050?path=${dev_path}`);
})();