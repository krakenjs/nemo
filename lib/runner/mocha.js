'use strict';

const NemoCore = require('nemo-core');
const CircularJSON = require('circular-json');
const Mocha = require('mocha');
const debug = require('debug');
const log = debug('nemo:mocha:log');
const path = require('path');

function MochaRunner(runnerConfig) {
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

  function createNemo() {
    let driverConf = typeof input.profile.conf.driver === 'string' ? `require:${input.profile.conf.driver}` : Object.assign({}, input.profile.conf.driver || {});
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
    this.nemo = nemoCoreObject;
    return Promise.resolve();
  }
  function beforeSuite(Suite) {
    log('suite event, suite %s, root: %s', Suite.title, Suite.root);
    if (input.profile.conf.driverPerTest) {
      log('driverPerTest %s', input.profile.conf.driverPerTest);
      Suite.beforeEach(function() {
        return createNemo()
          .then(bindNemo.bind(this));
      });
      Suite._beforeEach.unshift(Suite._beforeEach.pop());
      Suite.afterEach(destroyNemo);
      return;
    }
    // createNemo beforeAll (one nemo per suite)
    Suite.beforeAll(function() {
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
    return CircularJSON.stringify(test);
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
  input.profile.conf.tests.forEach(function (file) {
    log('%s: add file %s', input.profile.tags.uid, file);
    mocha.addFile(file);
  });

  if (input.profile.conf.parallel === 'file' && mocha.options.grep) {
    // TODO: can this be a more generalized check for zero tests?
    // if we're running parallel by file, make sure we really need to run()
    mocha.loadFiles();
    const throwawayRunner = new Mocha.Runner(mocha.suite);
    const matchingTests = throwawayRunner.grep(mocha.options.grep).total;
    if (!matchingTests) {
      // don't run the suite, just exit the process
      log('no tests. exiting');
      mochaCompleteResolvers.resolve(testResults);
      return mochaCompletePromise;
    }
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
