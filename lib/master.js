'use strict';

var spawn = require('threads').spawn;
var instance = require('../lib/instance');
var debug = require('debug');
var parallelLimit = require('async/parallelLimit');
var uuid = require('uuid/v4');
var log = debug('nemo:master:log');
const CJ = require('circular-json');

module.exports = function master() {
  var instanceResults = [];
  var complete = 0;
  var iconfig;
  var tasks;
  var maxConcurrent;
  const progress = function (progressObject) {
    try {
      if (progressObject.payload.test) {
        progressObject.payload.test = CJ.parse(progressObject.payload.test);
      }
      this.emitter.emit(progressObject.event, this, progressObject.payload);
    } catch (err) {
      console.error(err);
    }
    log(`call progress with event: ${progressObject.event}`);
  }.bind(this);
  this.emitter.on('instance:end', (context, result) => {
    result.testResults = result.testResults.map(safeResult => {
      return CJ.parse(safeResult);
    });
    instanceResults.push(result);
    if (context.instances.length === 1) {
      context.emitter.emit('master:end', context, instanceResults);
    }
  });
  if (this.instances.length === 1 && !this.program.fromServer) {

    iconfig = this.instances[0];

    log('single kickoff with instance %O', iconfig.tags);
    process.env = Object.assign({}, process.env, iconfig.conf.env || {});
    iconfig.tags.uid = uuid();
    return instance({basedir: this.program.baseDirectory, profile: iconfig, __dirname: __dirname}, err => {
      if (err) {
        console.error(err);
      }
    }, progress);
  }
  // parallel use case
  tasks = this.instances.map(function (iconf) {

    return function (done) {
      var thread = spawn(instance, {env: Object.assign({}, process.env, iconf.conf.env || {})});
      iconf.tags.uid = uuid();
      log('multi kickoff with instance %O', iconf.tags);
      thread
        .send({basedir: this.program.baseDirectory, profile: iconf, __dirname: __dirname})
        // The handlers come here: (none of them is mandatory)
        .on('message', function (summary) {
          log('Thread complete', summary);
          thread.kill();
        })
        .on('progress', progress)
        .on('error', function (er) {
          console.error(er);
          thread.kill();
        })
        .on('exit', function () {
          complete = complete + 1;
          log(`Thread exited. ${complete}/${this.instances.length}`);
          thread.removeAllListeners('message');
          thread.removeAllListeners('error');
          thread.removeAllListeners('exit');
          if (complete === this.instances.length) {
            this.emitter.emit('master:end', this, instanceResults);
          }
          done();
        }.bind(this));
    }.bind(this);
  }.bind(this));

  maxConcurrent = this.config.get('profiles:base:maxConcurrent') || Infinity;
  parallelLimit(tasks, maxConcurrent);
};
