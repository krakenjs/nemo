var NemoCore = require('nemo-core');
var master = require('../lib/master');
var flow = require('../lib/flow');
var async = require('async');
var debug = require('debug');
var log = debug('nemo:engine:log');
var uuidv4 = require('uuid/v4');
var masterID = uuidv4();
var Storage = require('./storage');
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
const path = require('path');
const axis = require('axis.js');

module.exports.configure = function configure(program) {
  return NemoCore.Configure(program.baseDirectory, {}).then(function (config) {
    return Promise.resolve({program: program, config: config});
  }).catch(function (err) {
    console.error('problem with main configuration %O', err);
  });
};
module.exports.configureJS = function configure(program) {
  let JSConfig = require(path.resolve(process.cwd(), program.configFile));
  return NemoCore.Configure(JSConfig).then(function (config) {
    return Promise.resolve({program: program, config: config});
  }).catch(function (err) {
    console.error('problem with main configuration %O', err);
  });
};
module.exports.start = function start(configuration) {
  let Nemo = configuration;
  let pFunk;
  let p = new Promise((resolve, reject) => {
    pFunk = {resolve, reject};
  });
  Nemo.masterID = masterID;
  Nemo.emitter = new Emitter();

  // TODO: deprecate Nemo.storage. Should implement 100% as event listeners
  Nemo.storage = new Storage(Nemo);
  // attach user event listeners
  let assignListener = listener => {
    if (axis.isObject(listener)) {
      Nemo.emitter.on(listener.type, listener.listener);
    } else {
      listener(Nemo.emitter);
    }
  };
  let listenerConfig = Nemo.config.get('output:listeners');
  // listenerConfig may be
  // - array of arrays
  // - array of objects
  // - array of functions
  // - single object
  // - single function
  if (listenerConfig) {
    if (axis.isArray(listenerConfig)) {
      let explode = (elt) => {
        if (axis.isArray(elt)) {
          elt.forEach(e => {
            explode(e);
          });
        } else {
          assignListener(elt);
        }
      };
      listenerConfig.forEach(elt => {
        explode(elt);
      });
    } else {
      assignListener(listenerConfig);
    }
  }
  let _flow = flow.map(function (fn) {
    return fn.bind(Nemo);
  });
  log('flow length %d', _flow.length);
  async.series(_flow, function (err) {
    if (err) {
      return pFunk.reject(err);
    }
    log('assembled %d instances', Nemo.instances.length);
    master(Nemo);
    pFunk.resolve(Nemo);
  });
  return p;
};
