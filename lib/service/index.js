'use strict';

let debug = require('debug')('raptor:service');
let Device = require('./device');
let emptyPort = require('empty-port');
let fetch = require('./fetch');
let R = require('ramda');
let tcpPortUsed = require('tcp-port-used');
let spawn = require('child_process').spawn;

const START_PORT = 4000;
const SERVICE = require.resolve('fxos-device-service/bin/fxos-device-service');

let getPort = () => {
  return new Promise((resolve, reject) => {
    emptyPort({ startPort: START_PORT }, (err, port) => err ? reject(err) : resolve(port));
  });
};

let get = (url) => {
  debug(`[Executing request] GET ${url}`);
  return fetch('GET', url).end();
};

let start = (port) => {
  debug(`Initializing device service on port ${port}`);
  let proc = spawn(SERVICE, [port], { stdio: 'ignore' });
  let kill = () => proc.kill();

  process.on('beforeExit', kill);
  process.on('complete', kill);
  return tcpPortUsed.waitUntilUsed(port);
};

let selectDevice = (serial) => {
  return R.cond([
    [R.always(R.isNil(serial)), R.head],
    [R.T, R.find(R.propEq('serial', serial))]
  ]);
};

module.exports = (options) => {
  let url = '';
  let queryString = options.adbHost ?
    `host=${options.adbHost}&port=${options.adbPort}` :
    '';

  return Promise
    .resolve()
    .then(getPort)
    .then(R.tap(port => url = `http://localhost:${port}`))
    .then(start)
    .then(() => get(`${url}/devices${queryString}`).then(r => r.body))
    .then(selectDevice(options.serial))
    .then(device => new Device(`${url}/devices/${device.id}`))
    .catch(err => {
      throw R.test(/Cannot read property/, err.message) ?
        new Error('Unable to find device') :
        err;
    });
};
