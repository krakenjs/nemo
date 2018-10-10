'use strict';

const spawn = require('threads').spawn;
const instance = require('../lib/instance');
const debug = require('debug');
const parallelLimit = require('async/parallelLimit');
const uuid = require('uuid/v4');
const log = debug('nemo:master:log');
const cJSON = require('flatted');

module.exports = function master(Nemo) {
  let instanceResults = [];
  let complete = 0;
  let iconfig;
  let tasks;
  let maxConcurrent;
  const progress = function (progressObject) {
    // check for custom event
    if (progressObject.event === 'custom') {
      // do custom stuff
      let customEvent = progressObject.payload.eventObject.eventName;
      let customEventPayload = cJSON.parse(progressObject.payload.eventObject.event);
      Nemo.emitter.emit(customEvent, Nemo, {tags: progressObject.payload.tags, payload: customEventPayload});
      return;
    }
    try {
      if (progressObject.payload.test) {
        progressObject.payload.test = cJSON.parse(progressObject.payload.test);
      }
      Nemo.emitter.emit(progressObject.event, Nemo, progressObject.payload);
    } catch (err) {
      console.error(err);
    }
    log(`call progress with event: ${progressObject.event}`);
  };
  Nemo.emitter.on('instance:end', (context, result) => {
    result.testResults = result.testResults.map(safeResult => {
      return cJSON.parse(safeResult);
    });
    instanceResults.push(result);
    if (context.instances.length === 1) {
      context.emitter.emit('master:end', context, instanceResults);
    }
  });
  if (Nemo.instances.length === 1 && !Nemo.program.fromServer) {
    iconfig = Nemo.instances[0];

    log('single kickoff with instance %O', iconfig.tags);
    process.env = Object.assign({}, process.env, iconfig.conf.env || {});
    iconfig.tags.uid = uuid();
    return instance({basedir: Nemo.program.baseDirectory, profile: iconfig, __dirname: __dirname}, err => {
      if (err) {
        console.error(err);
      }
    }, progress);
  }
  // parallel use case
  tasks = Nemo.instances.map(function (iconf) {
    return function (done) {
      let thread = spawn(instance, {env: Object.assign({}, process.env, iconf.conf.env || {})});
      iconf.tags.uid = uuid();
      log('multi kickoff with instance %O', iconf.tags);
      thread
        .send({basedir: Nemo.program.baseDirectory, profile: iconf, __dirname: __dirname})
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
          log(`Thread exited. ${complete}/${Nemo.instances.length}`);
          thread.removeAllListeners('message');
          thread.removeAllListeners('error');
          thread.removeAllListeners('exit');
          if (complete === Nemo.instances.length) {
            Nemo.emitter.emit('master:end', Nemo, instanceResults);
          }
          done();
        });
    };
  });

  maxConcurrent = Nemo.config.get('profiles:base:maxConcurrent') || Infinity;
  parallelLimit(tasks, maxConcurrent);
};
