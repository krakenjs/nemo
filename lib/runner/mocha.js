'use strict';

const NemoCore = require('nemo-core');
const CircularJSON = require('circular-json');
const Mocha = require('mocha');
const debug = require('debug');
const log = debug('nemo:mocha:log');
const path = require('path');

function MochaRunner(runnerConfig) {
  let nemo = null;
  let testResults = [];
  let mochaCompleteResolvers = null;
  let runner;
  let modulesToRequire = [];
  let input = runnerConfig.input;
  let mocha = new Mocha(input.profile.conf.mocha);
  let requireFromConfig = input.profile.conf.mocha.require;
  let mochaCompletePromise = new Promise(function (resolve, reject) {
    mochaCompleteResolvers = {resolve, reject};
  });

  function suiteEventListener(Suite) {
    log('suite event, suite %s, root: %s', Suite.title, Suite.root);
    if (nemo && nemo.driver) {
      return;
    }
    Suite.beforeAll(function () {
      let driverConf = Object.assign({}, input.profile.conf.driver || {});
      let dataConf = Object.assign({}, input.profile.conf.data || {});

      return NemoCore.Configure(input.basedir, {
        plugins: {
          snap: {
            module: path.resolve(input.__dirname, 'screenshot'),
            arguments: [
              input.profile.conf.reports
            ]
          }
        },
        driver: driverConf,
        data: dataConf
      }).then((nemoCoreConfig) => {
        return NemoCore(nemoCoreConfig);
      })
        .then(function (nemoCoreObject) {
          nemo = nemoCoreObject;
          return Promise.resolve();
        });
    });
    Suite._beforeAll.unshift(Suite._beforeAll.pop());
  }

  function testStartEventListener(Test) {
    Test.ctx.nemo = nemo;
    nemo.mocha = Test.ctx;
  }

  function suiteEndEventListener(Evt) {
    log('suite end called for %s which is root: %s', Evt.title, Evt.root);
    if (Evt.root && nemo && nemo.driver) {
      nemo.driver.quit()
        .then(function () {
          log('Suite is ended. Quit driver');
        });
    }
  }

  function mochaRunnerCallback(failures) {
    log(`exit instance with failures ${!!failures}`);
    mochaCompleteResolvers.resolve(testResults);
  }

  function prepareTestResult(test) {
    if (test.err) {
      test.errSafe = {
        name: test.err.name || 'test err.name DNE',
        stack: test.err.stack || 'test err.stack DNE'
      };
    }
    test.fullTitleString = test.fullTitle();
    return CircularJSON.stringify(test);
  }

  function testCompleteEventListener(test, err) {
    if (err) {
      console.error('fail', err);
    }
    let testCircularSafe = prepareTestResult(test);
    runnerConfig.emitter.emit('test', testCircularSafe);
    testResults.push(testCircularSafe);
  }

  // if an array was already declared, use it
  if (requireFromConfig && Array.isArray(requireFromConfig)) {
    modulesToRequire = requireFromConfig;

    // else if it was a single module declared, format to array
  } else if (requireFromConfig && typeof requireFromConfig === 'string') {
    modulesToRequire = [requireFromConfig];
  }

  modulesToRequire.forEach(function (module) {
    try {
      require(module);
    } catch (err) {
      console.error(err);
    }
  });

  // add files
  input.profile.conf.tests.forEach(function (file) {
    log('%s: add file %s', input.profile.tags.uid, file);
    mocha.addFile(file);
  });

  log('look for matching tests based on instance configuration');
  mocha.loadFiles();
  const throwawayRunner = new Mocha.Runner(mocha.suite);
  const matchingTests = throwawayRunner.grep(mocha.options.grep).total;
  if (!matchingTests) {
    // don't run the suite, just exit the process
    log('no tests. exiting');
    mochaCompleteResolvers.resolve(testResults);
    return mochaCompletePromise;
  }
  log('start');
  runner = mocha.run(mochaRunnerCallback);
  runner.on('test', testStartEventListener);
  runner.on('pass', testCompleteEventListener);
  runner.on('fail', testCompleteEventListener);
  runner.on('suite', suiteEventListener);
  runner.on('suite end', suiteEndEventListener);
  return mochaCompletePromise;
}

module.exports = MochaRunner;
