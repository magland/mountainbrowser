const MountainClient = require('../../src/mountainclient-js').MountainClient;

window.using_electron = true;

window.electron_new_mountainclient = function() {
    return new MountainClient({fs: require('fs')});
}