'use strict';

var spawn = require('threads').spawn;
var instance = require('../lib/instance');
var debug = require('debug');
var parallelLimit = require('async/parallelLimit');
var uuid = require('uuid/v4');
var log = debug('nemo:master:log');
var error = debug('nemo:master:error');
const CJ = require('circular-json');

function InstanceManager(engineConfig) {
  this.configuration = engineConfig;
  this.completeInstances = 0;
  this.results = [];
}

InstanceManager.prototype.run = function run() {
  // Spawn a thread for each instance detemined by the settings for parallel set up
  // in the config, and by the number of greps, etc. that a user used to when starting
  // this run.
  const self = this; // eslint-disable-line
  const maxConcurrent = this.configuration.config.get('profiles:base:maxConcurrent') || Infinity;
  const asyncTasks = this.configuration.instances.map(function (iconf) {
    return function (done) {
      self.startInstance(iconf, done);
    };
  });

  parallelLimit(asyncTasks, maxConcurrent);
};

InstanceManager.prototype.startInstance = function (instanceConfig, done) {
  instanceConfig.tags.uid = uuid();
  const thread = spawn(instance, {env: Object.assign({}, process.env, instanceConfig.conf.env || {})});
  thread
    .send({
      basedir: this.configuration.program.baseDirectory,
      profile: instanceConfig,
      __dirname: __dirname
    })
    .on('message', function () {
      // the thread has called done() and is ready to be killed
      thread.kill();
    })
    .on('progress', function (progressObject) {
      if (progressObject.payload.test) {
        try {
          progressObject.payload.test = CJ.parse(progressObject.payload.test);
          this.saveResult(progressObject.payload.test);
          this.configuration.emitter.emit(progressObject.event, this.configuration, progressObject.payload);
        } catch (err) {
          error(err);
        }
      }
    }.bind(this))
    .on('error', function (er) {
      error(er);
      thread.kill();
    })
    .on('exit', function () {
      log(`Thread exited. ${this.completeInstances}/${this.configuration.instances.length}`);
      thread.removeAllListeners('message');
      thread.removeAllListeners('progress');
      thread.removeAllListeners('error');
      thread.removeAllListeners('exit');
      this.completeInstances = this.completeInstances + 1;
      if (this.completeInstances === this.configuration.instances.length) {
        console.log('Everything is done. Shutting down nemo.');
        /* eslint-enable */
        // this.configuration.emitter.emit('master:end', this.configuration, summary);
      }
      done();
    }.bind(this));
};

InstanceManager.prototype.resultMap = function (data) {
  /**
   * This function could be pulled and set from the config:
   *
   * myMap = require .. config.reporter.map
   * return { ...data, ...myMap(data) }
   *
   * It can allow users to take the standard test data and generate convenient flags based on the values.
   * e.g. jawsFailure, sluggishStageFailure, specialFailureWeWantToTrack = true
   */
  const map = (d) => d;
  return Object.assign({}, data, map(data));
};

InstanceManager.prototype.saveResult = function (result) {
  this.results.push(this.resultMap(result));
};

module.exports = InstanceManager;
