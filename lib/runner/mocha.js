'use strict';

const NemoCore = require('nemo-core');
const cJSON = require('flatted');
const Mocha = require('mocha');
const debug = require('debug');
const log = debug('nemo:mocha:log');
const {v4: uuidv4} = require('uuid');

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
    let pluginConf = Object.assign({}, instanceConfig.profile.conf.plugins || {});
    let NemoBaseConfig;
    return NemoCore.Configure(instanceConfig.profile.conf.baseConfigPath)
      .then(function (nemoBaseConfig) {
        NemoBaseConfig = nemoBaseConfig;
        if (instanceConfig.basedir) {
          // confit use case
          return NemoCore.Configure(instanceConfig.basedir, {
            driver: driverConf,
            data: dataConf
          });
        }
        // plain JS config use case
        return NemoCore.Configure({
          plugins: pluginConf,
          driver: driverConf,
          data: dataConf
        });
      })
      .then((nemoCoreConfig) => {
        NemoBaseConfig.merge(nemoCoreConfig);
        return NemoCore(NemoBaseConfig)
          .then(nemo => {
            nemo.instanceId = uuidv4();
            log('Instantiated new nemo instance', nemo.instanceId);
            return nemo;
          });
      });
  }

  function destroyNemo() {
    log('destroyNemo: called');
    if (this.nemo) {
      if (this.nemo.driver) {
        log('Quitting nemo instance', this.nemo.instanceId);
        return this.nemo.driver.quit()
          .then(function () {
            log('destroyNemo: Quit driver');
            return Promise.resolve();
          });
      }
      log(`Nemo instance ${this.nemo.instanceId} does not have a driver to quit`);
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

  function beforeRun() {
    const Root = runner.suite;

    runnerConfig.emitter.emit('root:before');
    log('beforeRun called');

    if (instanceConfig.profile.conf.driverPerTest) {
      log('driverPerTest %s', instanceConfig.profile.conf.driverPerTest);
      Root.beforeEach(function () {
        return createNemo()
          .then(bindNemo.bind(this));
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
          return createNemo()
            .then(bindNemo.bind(this));
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
  const matchingTests = (mocha.options.grep) ? throwawayRunner.grep(mocha.options.grep).total : throwawayRunner.total;
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
  runner.on('suite end', afterSuite);

  return mochaCompletePromise;
}

module.exports = MochaRunner;
