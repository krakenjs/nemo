'use strict';
module.exports = function instance(instanceConfig, instanceComplete, instanceProgress) {
  const path = require('path');
  const Runner = require(path.resolve(instanceConfig.__dirname, 'runner/mocha'));
  const EventEmitter = require('events');
  let startMS = Date.now();

  class Emitter extends EventEmitter {
  }

  const emitter = new Emitter();
  let runnerConfig = {
    instanceConfig,
    emitter
  };
  Runner(runnerConfig)
    .then((testResults) => {
      instanceProgress({
        event: 'instance:end', payload: {
          tags: instanceConfig.profile.tags,
          duration: Date.now() - startMS,
          testResults
        }
      });
      instanceComplete();
    })
    .catch((err) => {
      console.error(err);
      instanceComplete(err);
    });
  instanceProgress({
    event: 'instance:start',
    payload: {
      tags: instanceConfig.profile.tags
    }
  });
  emitter.on('test', (test) => {
    instanceProgress({event: 'test', payload: {tags: instanceConfig.profile.tags, test}});
  });
  emitter.on('test:before', (test) => {
    instanceProgress({event: 'test:before', payload: {tags: instanceConfig.profile.tags, test}});
  });
  emitter.on('suite:before', () => {
    instanceProgress({event: 'suite:before', payload: {tags: instanceConfig.profile.tags}});
  });
  emitter.on('suite', () => {
    instanceProgress({event: 'suite', payload: {tags: instanceConfig.profile.tags}});
  });
  emitter.on('custom', (eventObject) => {
    instanceProgress({event: 'custom', payload: {tags: instanceConfig.profile.tags, eventObject}});
  });
};
