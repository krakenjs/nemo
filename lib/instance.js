'use strict';
module.exports = function instance(input, instanceComplete, progress) {
  var Nemo = require('nemo-core');
  var CircularJSON = require('circular-json');
  var Mocha = require('mocha');
  var path = require('path');
  var debug = require('debug');
  var log = debug('nemo:instance:log');
  var startMS;
  var mocha;
  var testResults = [];
  var driverConfig;
  var runner;
  var prepareTestResult = (test, err) => {
    if (err) {
      test.err = err || 'test err DNE';
    }
    test.fullTitleString = test.fullTitle();
    return CircularJSON.stringify(test);
  };
  var exitInstance = function (failures, _testResults) {
    progress({
      event: 'instance:end', payload: {
        tags: input.profile.tags,
        duration: Date.now() - startMS,
        reportFile: input.profile.reportFile,
        testResults: _testResults
      }
    });
    instanceComplete();
  };

  var defineSuite = function (config) {
    var nemo;
    var requireFromConfig = input.profile.conf.mocha.require;
    var modulesToRequire = [];

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

    // make a Mocha
    mocha = new Mocha(input.profile.conf.mocha);
    // add files
    input.profile.conf.tests.forEach(function (file) {
      log('%s: add file %s', input.profile.tags.uid, file);
      mocha.addFile(file);
    });
    // calculate driver configuration
    driverConfig = input.profile.conf.driver;
    config.set('driver', Object.assign({}, config.get('driver'), driverConfig));
    config.set('data', Object.assign({}, input.profile.conf.data || config.get('data')));

    if (input.profile.conf.parallel === 'file' && mocha.options.grep) {
      // if we're running parallel by file, make sure we really need to run()
      mocha.loadFiles();
      const throwawayRunner = new Mocha.Runner(mocha.suite);
      const matchingTests = throwawayRunner.grep(mocha.options.grep).total;
      if (!matchingTests) {
        // don't run the suite, just exit the process
        return exitInstance();
      }
    }
    log('start');
    progress({
      event: 'instance:start',
      payload: {
        tags: input.profile.tags
      }
    });
    startMS = Date.now();
    runner = mocha.run(function (failures) {
      exitInstance(failures, testResults);
    });
    runner.on('test', function (Test) {

      Test.ctx.nemo = nemo;
      nemo.mocha = Test.ctx;
    });
    runner.on('pass', function (test) {
      log('pass');
      let testCircularSafe = prepareTestResult(test);
      progress({event: 'test', payload: {tags: input.profile.tags, test: testCircularSafe}});
      testResults.push(testCircularSafe);
    });
    runner.on('fail', function (test, err) {
      console.error('fail', err);
      let testCircularSafe = prepareTestResult(test);
      progress({event: 'test', payload: {tags: input.profile.tags, test: testCircularSafe}});
      testResults.push(testCircularSafe);
    });
    runner.on('hook', function (Evt) {
      Evt.ctx.nemo = nemo;
    });

    runner.on('suite', function (Suite) {
      log('suite event, suite %s, root: %s', Suite.title, Suite.root);
      if (!(nemo && nemo.driver)) {
        Suite.beforeAll(function checkNemo(suiteBeforeComplete) {
          Nemo(config).then(function (_nemo) {
            nemo = _nemo;
            nemo.runner = {
              context: input
            };
            suiteBeforeComplete();
          }).catch(function (err) {
            console.error(err);
            suiteBeforeComplete(err);
            instanceComplete(err);
          });
        });
        Suite._beforeAll.unshift(Suite._beforeAll.pop());
      }
    });
    runner.on('suite end', function (Evt) {
      log('suite end called for %s which is root: %s', Evt.title, Evt.root);
      if (Evt.root && nemo && nemo.driver) {
        nemo.driver.quit()
          .then(function () {
            log('Suite is ended. Quit driver');
          });
      }
    });
    // currently unused mocha lifecycle events
    // runner.on('start', function (Arg) {
    //         // never called. filed https://github.com/mochajs/mocha/issues/2753
    // });
    // runner.on('test end', function (Test) {
    //         // not using this currently
    // });
    // runner.on('hook end', function (Evt) {
    //         // not using this currently
    // });
  };
  Nemo.Configure(input.basedir, {
    plugins: {
      snap: {
        module: path.resolve(input.__dirname, 'screenshot')
      }
    }
  }).then(defineSuite)
    .catch(function (err) {
      console.error(err);
      instanceComplete(err);
    });
};
