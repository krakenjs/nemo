var Nemo = require('nemo-core');
var Master = require('../lib/master');
var flow = require('../lib/flow');
var async = require('async');
var debug = require('debug');
var log = debug('nemo:engine:log');
var error = debug('nemo:engine:error');
var uuidv4 = require('uuid/v4');
var masterID = uuidv4();
var Storage = require('./storage');
const EventEmitter = require('events');
class Emitter extends EventEmitter {}

module.exports.configure = function configure(program) {
  return Nemo.Configure(program.baseDirectory, {}).then(function (config) {
    return Promise.resolve({program: program, config: config});
  }).catch(function (err) {
    error('problem with main configuration %O', err);
  });
};

module.exports.start = function start(configuration) {
  let pFunk;
  let p = new Promise((resolve, reject) => {
    pFunk = {resolve, reject};
  });
  configuration.masterID = masterID;
  configuration.storage = new Storage(configuration);
  configuration.emitter = new Emitter();
  // attach user event listeners
  if (configuration.config.get('output:listeners')) {
    configuration.config.get('output:listeners').forEach(listener => {
      configuration.emitter.on(listener.type, listener.listener);
    });
  }
  // attach storage listener
  configuration.storage.listeners.forEach(listener => {
    configuration.emitter.on(listener.type, listener.listener);
  });

  let _flow = flow.map(function (fn) {
    return fn.bind(configuration);
  });
  log('flow length %d', _flow.length);
  async.series(_flow, function (err) {
    if (err) {
      return pFunk.reject(err);
    }
    log('assembled %d instances', configuration.instances.length);
    let master = new Master(configuration);
    master.run();
    pFunk.resolve(configuration);
  });
  return p;
};
