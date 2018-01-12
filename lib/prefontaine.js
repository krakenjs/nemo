var Nemo = require('nemo-core');
var starter = require('../lib/starter');
var flow = require('../lib/flow');
var async = require('async');
var debug = require('debug');
var log = debug('nemo:log');
var error = debug('nemo:error');
var uuidv4 = require('uuid/v4');
var masterID = uuidv4();
var Storage = require('./storage');

module.exports = function prefontaine(program) {
  return Nemo.Configure(program.baseDirectory, {}).then(function (config) {
    let pre = {program: program, config: config};
    return Promise.resolve(pre);
  }).catch(function (err) {
    error('problem with main configuration %O', err);
  });
};

module.exports.start = function start(prefontaine) {
  let pFunk;
  let p = new Promise((resolve, reject) => {
    pFunk = {resolve, reject};
  });
  prefontaine.masterID = masterID;
  prefontaine.storage = new Storage(prefontaine);
  let _flow = flow.map(function (fn) {
    return fn.bind(prefontaine);
  });
  log('flow length %d', _flow.length);
  async.series(_flow, function (err) {
    if (err) {
      return pFunk.reject(err);
    }
    log('assembled %d instances', prefontaine.instances.length);
    starter.apply(prefontaine);
    pFunk.resolve(prefontaine);
  });
  return p;
};
