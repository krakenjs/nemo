'use strict';
module.exports = function instance(input, instanceComplete, instanceProgress) {
  const path = require('path');
  const Runner = require(path.resolve(input.__dirname, 'runner/mocha'));
  const EventEmitter = require('events');
  let startMS;
  class Emitter extends EventEmitter {}
  const emitter = new Emitter();
  let runnerConfig = {
    input,
    emitter
  };
  Runner(runnerConfig)
    .then((testResults) => {
      instanceProgress({
        event: 'instance:end', payload: {
          tags: input.profile.tags,
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
      tags: input.profile.tags
    }
  });
  emitter.on('test', (test) => {
    instanceProgress({event: 'test', payload: {tags: input.profile.tags, test}});
  });

};
