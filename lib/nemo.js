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
const Mocha = require('mocha');

class Emitter extends EventEmitter {}

module.exports.configure = function configure(program) {
  return NemoCore.Configure(program.baseDirectory, {}).then(function (config) {
    return Promise.resolve({program: program, config: config});
  }).catch(function (err) {
    console.error('problem with main configuration %O', err);
  });
};

module.exports.check = function check(configuration) {

  let Nemo = configuration;
  let pFunk;
  let p = new Promise((resolve, reject) => {
    pFunk = {resolve, reject};
  });
  Nemo.masterID = masterID;
  Nemo.emitter = new Emitter();


  let _flow = flow.map(function (fn) {
    return fn.bind(Nemo);
  });
  log('flow length %d', _flow.length);
  async.series(_flow, function (err) {
    if (err) {
      return pFunk.reject(err);
    }
    log('assembled %d instances', Nemo.instances.length);
    // check how many tests
    Nemo.instances.forEach(function (instance) {
      let mocha = new Mocha(instance.conf.mocha);
      instance.conf.tests.forEach(function (file) {
        log('added file %s', file);
        mocha.addFile(file);
      });
      mocha.loadFiles();
      const throwawayRunner = new Mocha.Runner(mocha.suite);
      const matchingTests = (mocha.options.grep) ? throwawayRunner.grep(mocha.options.grep).total : throwawayRunner.total;
      if (!matchingTests) {
        // don't run the suite, just exit the process
        return log('no tests. exiting');
      }
      log(`${matchingTests} matchingTests`);
    });
    // console.log('meeeeliions');
    pFunk.resolve(Nemo);
  });
  return p;
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
  if (Nemo.config.get('output:listeners')) {
    Nemo.config.get('output:listeners').forEach(listener => {
      Nemo.emitter.on(listener.type, listener.listener);
    });
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
