'use strict';

const NemoCore = require('nemo-core');
const cJSON = require('flatted');
const Mocha = require('mocha');
const debug = require('debug');
const log = debug('nemo:mocha:log');

function MochaRunner(runnerConfig) {
  log(runnerConfig.instanceConfig.profile);
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
      log(
        `profile level driver override as string: ${instanceConfig.profile.conf.driver}`
      );
      driverConf = `require:${instanceConfig.profile.conf.driver}`;
    } else if (typeof instanceConfig.profile.conf.driver === 'object') {
      log('profile level driver override as object');
      log(instanceConfig.profile.conf.driver);
      driverConf = Object.assign({}, instanceConfig.profile.conf.driver || {});
    }

    let data = Object.assign({}, instanceConfig.profile.conf.data || {});
    let plugins = Object.assign({}, instanceConfig.profile.conf.plugins || {});
    let driver = driverConf;
    // this logic around driver override is to avoid overriding a "string" driver with an empty object
    let baseOverrideConf = Object.assign({}, driver ? {driver} : driver, {
      data
    });
    let NemoBaseConfig;
    return NemoCore.Configure(instanceConfig.profile.conf.baseConfigPath)
      .then(function (nemoBaseConfig) {
        NemoBaseConfig = nemoBaseConfig;
        if (instanceConfig.basedir) {
          // confit use case
          let confitOverrideConf = baseOverrideConf;
          log('confitOverrideConf');
          log(confitOverrideConf);
          return NemoCore.Configure(instanceConfig.basedir, confitOverrideConf);
        }
        // plain JS config use case
        let pojsOverrideConf = Object.assign({}, baseOverrideConf, {plugins});
        log('pojsOverrideConf');
        log(pojsOverrideConf);
        return NemoCore.Configure(pojsOverrideConf);
      })
      .then(nemoCoreConfig => {
        NemoBaseConfig.merge(nemoCoreConfig);
        return NemoCore(NemoBaseConfig);
      });
  }

  async function destroyNemo() {
    log('destroyNemo: called');
    if (this.nemo && this.nemo.driver && this.nemo.driver.quit) {
      log('Quitting nemo driver instance');
      try {
        await this.nemo.driver.quit();
      } catch (err) {
        return log('failed to kill driver');
      }
      log('succeeded to kill driver');
    } else {
      log('Nemo instance does not have a driver to quit');
    }
    return;
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

  function beforeRun() {
    const Root = runner.suite;

    runnerConfig.emitter.emit('root:before');
    log('beforeRun called');

    if (instanceConfig.profile.conf.driverPerTest) {
      log('driverPerTest %s', instanceConfig.profile.conf.driverPerTest);
      Root.beforeEach(function () {
        return createNemo().then(bindNemo.bind(this));
      });
      if (Root._beforeEach.length > 0) {
        Root._beforeEach.unshift(Root._beforeEach.pop());
      }
      Root.afterEach(destroyNemo);
      return;
    }
  }

  function beforeSuite(Suite) {
    runnerConfig.emitter.emit('suite:before');
    log('suite event, suite %s, root: %s', Suite.title, Suite.root);
    if (!instanceConfig.profile.conf.driverPerTest) {
      Suite.beforeAll(function () {
        if (Suite.tests.length > 0) {
          return createNemo().then(bindNemo.bind(this));
        }
        return;
      });

      if (Suite._beforeAll.length > 0) {
        // add nemo's beforeAll to the FRONT of the beforeAll array
        Suite._beforeAll.unshift(Suite._beforeAll.pop());
      }

      // afterAll, kill nemo
      Suite.afterAll(destroyNemo);
    }
  }

  function afterSuite(Evt) {
    runnerConfig.emitter.emit('suite');
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

  function beforeEachTest(test, err) {
    if (err) {
      console.error(err);
    }
    let testCircularSafe = prepareTestResult(test);
    runnerConfig.emitter.emit('test:before', testCircularSafe);
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
  mocha.loadFiles();

  // make sure we really need to run()
  const throwawayRunner = new Mocha.Runner(mocha.suite);
  const matchingTests = mocha.options.grep
    ? throwawayRunner.grep(mocha.options.grep).total
    : throwawayRunner.total;
  if (!matchingTests) {
    log('no tests. exiting');
    mochaCompleteResolvers.resolve(testResults);
    return mochaCompletePromise;
  }

  log('start');
  runner = mocha.run(afterMocha);
  runner.on('start', beforeRun);
  runner.on('test', beforeEachTest);
  runner.on('pass', afterEachTest);
  runner.on('fail', afterEachTest);
  runner.on('suite', beforeSuite);
  runner.on('EVENT_RUN_END', afterSuite);

  return mochaCompletePromise;
}

module.exports = MochaRunner;
