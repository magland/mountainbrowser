const express = require('express');
const path = require('path');

const MountainClient = require('./mountainclient-js').MountainClient;

const reload = require('reload');
const watch = require('watch');


let mt = new MountainClient();
mt.configDownloadFrom(['spikeforest.public']);

const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '/../client/dist')));

// Load object
app.get("/api/loadObject", async (req, res) => {
    let path = decodeURIComponent(req.query.path)

    let obj = await mt.loadObject(path);
    if (obj) {
        res.send({ success: true, object: obj });
    }
    else {
        res.send({ success: false });
    }
});
// Resolve key path
app.get("/api/resolveKeyPath", async (req, res) => {
    let path = decodeURIComponent(req.query.path)

    let txt = await mt.resolveKeyPath(path);
    if (txt) {
        res.send({ success: true, text: txt });
    }
    else {
        res.send({ success: false });
    }
});
// Load text
app.get("/api/loadText", async (req, res) => {
    let path = decodeURIComponent(req.query.path)

    let txt = await mt.loadText(path);
    if (txt) {
        res.send({ success: true, text: txt });
    }
    else {
        res.send({ success: false });
    }
});
// Find file
app.get("/api/findFile", async (req, res) => {
    let path = decodeURIComponent(req.query.path)

    let url = await mt.findFile(path);
    if (url) {
        res.send({ success: true, url: url });
    }
    else {
        res.send({ success: false });
    }
});

// Handles any requests that don't match the ones above
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../client/dist/index.html'));
});

reload(app).then((reloadReturned) => {
    console.log('reloadReturned...');
    watch.watchTree(__dirname + "/../client/dist", {interval: 2}, function (f, curr, prev) {
        console.info('Triggering reload');
        // Fire server-side reload event
        reloadReturned.reload();
    });
});
watch.watchTree(__dirname + "/../client/public", {interval: 2}, function (f, curr, prev) {
    console.info('copying index.html');
    require('fs').copyFileSync(__dirname + "/../client/public/index.html", __dirname + "/../client/dist/index.html")
});
// watch.watchTree(__dirname + "/../client", function (f, curr, prev) {
//     console.info('Something changed in client/');
// });

const port = process.env.PORT || 5000;
app.listen(port);
console.log(`App is listening on port ${port}`);