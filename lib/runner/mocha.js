'use strict';

const NemoCore = require('nemo-core');
const cJSON = require('flatted');
const Mocha = require('mocha');
const debug = require('debug');
const log = debug('nemo:mocha:log');

function MochaRunner(runnerConfig) {
  let testResults = [];
  let mochaCompleteResolvers = null;
  let runner;
  let modulesToRequire = [];
  let instanceConfig = runnerConfig.instanceConfig;
  let mocha = new Mocha(instanceConfig.profile.conf.mocha);
  let requireFromConfig = instanceConfig.profile.conf.mocha.require;
  let mochaCompletePromise = new Promise(function (resolve, reject) {
    mochaCompleteResolvers = {resolve, reject};
  });

  function createNemo() {
    let driverConf;
    if (typeof instanceConfig.profile.conf.driver === 'string') {
      driverConf = `require:${instanceConfig.profile.conf.driver}`;
    } else {
      driverConf = Object.assign({}, instanceConfig.profile.conf.driver || {});
    }
    let dataConf = Object.assign({}, instanceConfig.profile.conf.data || {});
    let NemoBaseConfig;
    return NemoCore.Configure(instanceConfig.profile.conf.baseConfigPath)
      .then(function (nemoBaseConfig) {
        NemoBaseConfig = nemoBaseConfig;
        return NemoCore.Configure(instanceConfig.basedir, {
          driver: driverConf,
          data: dataConf
        });
      })
      .then((nemoCoreConfig) => {
        NemoBaseConfig.merge(nemoCoreConfig);
        return NemoCore(NemoBaseConfig);
      });
  }

  function destroyNemo() {
    log('destroyNemo: called');
    if (this.nemo) {
      return this.nemo && this.nemo.driver && this.nemo.driver.quit()
        .then(function () {
          log('destroyNemo: Quit driver');
          return Promise.resolve();
        });
    }
  }

  function bindNemo(nemoCoreObject) {
    nemoCoreObject.mocha = this;
    nemoCoreObject.runner = {
      reportPath: instanceConfig.profile.conf.reports,
      emit: function (eventName, event = {}) {
        runnerConfig.emitter.emit('custom', {
          eventName,
          event: cJSON.stringify(event)
        });
      }
    };
    this.nemo = nemoCoreObject;
    return Promise.resolve();
  }

  function beforeSuite(Suite) {
    log('suite event, suite %s, root: %s', Suite.title, Suite.root);
    if (instanceConfig.profile.conf.driverPerTest) {
      log('driverPerTest %s', instanceConfig.profile.conf.driverPerTest);
      Suite.beforeEach(function () {
        return createNemo()
          .then(bindNemo.bind(this));
      });
      Suite._beforeEach.unshift(Suite._beforeEach.pop());
      Suite.afterEach(destroyNemo);
      return;
    }
    // createNemo beforeAll (one nemo per suite)
    Suite.beforeAll(function () {
      return createNemo()
        .then(bindNemo.bind(this));
    });
    // add nemo's beforeAll to the FRONT of the beforeAll array
    Suite._beforeAll.unshift(Suite._beforeAll.pop());

    // afterAll, kill nemo
    Suite.afterAll(function () {
      destroyNemo.call(this);
    });
  }


  function afterSuite(Evt) {
    log('suite end called for %s which is root: %s', Evt.title, Evt.root);
  }

  function afterMocha(failures) {
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
    return cJSON.stringify(test);
  }

  function afterEachTest(test, err) {
    if (err) {
      console.error(err);
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
  instanceConfig.profile.conf.tests.forEach(function (file) {
    log('%s: add file %s', instanceConfig.profile.tags.uid, file);
    mocha.addFile(file);
  });

  // make sure we really need to run()
  mocha.loadFiles();
  const throwawayRunner = new Mocha.Runner(mocha.suite);
  const matchingTests = (mocha.options.grep) ? throwawayRunner.grep(mocha.options.grep).total : throwawayRunner.total;
  if (!matchingTests) {
    // don't run the suite, just exit the process
    log('no tests. exiting');
    mochaCompleteResolvers.resolve(testResults);
    return mochaCompletePromise;
  }

  log('start');
  runner = mocha.run(afterMocha);
  runner.on('pass', afterEachTest);
  runner.on('fail', afterEachTest);
  runner.on('suite', beforeSuite);
  runner.on('suite end', afterSuite);
  return mochaCompletePromise;
}

module.exports = MochaRunner;
