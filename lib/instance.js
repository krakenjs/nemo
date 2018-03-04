'use strict';
module.exports = function instance(input, done, progress) {
  var Nemo = require('nemo-core');
  var CircularJSON = require('circular-json');
  var Mocha = require('mocha');
  var path = require('path');
  var debug = require('debug');
  var log = debug('nemo:instance:log');
  var error = debug('nemo:instance:error');
  var startMS;
  var mocha;
  var anyTests = false;
  var result = {tags: input.profile.tags, total: 0, pass: 0, fail: 0};
  var driverConfig;
  var runner;
  var prepareTestResult = (test, err) => {
    if (err) {
      test.err = err.name || 'test err.name DNE';
      test.stack = err.stack || 'test err.stack DNE';
    }
    test.fullTitleString = test.fullTitle();
    return {
      test: CircularJSON.stringify(test),
      tags: input.profile.tags
    };
  };
  var exitInstance = function (failures, summary) {
    if (summary) {
      log('summary');
      progress('instance:end', {
        tags: input.profile.tags,
        duration: Date.now() - startMS
      });
    }
    if (!done && process) {
      // only attach this listener if we aren't running in parallel
      process.on('exit', function () {
        // exit with non-zero status if there were failures
        console.log(`nemo exiting with ${failures || 0} failures`);
        process.exit(failures);
      });
    }
    // attempted to run with no matching suites/tests
    if (!anyTests && done) {
      done(summary);
    }
  };

  var defineSuite = function (config) {
    // console.log(config);
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
        throw new Error(err);
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
    progress('instance:start', {
      tags: input.profile.tags
    });
    startMS = Date.now();
    runner = mocha.run(function (failures) {
      exitInstance(failures, result);
    });
    runner.on('test', function (Test) {

      Test.ctx.nemo = nemo;
      nemo.mocha = Test.ctx;
    });
    runner.on('pass', function (test) {
      log('pass');
      try {
        progress('pass', prepareTestResult(test));
      } catch (err) {
        error(err);
      }
      result.total = result.total + 1;
      result.pass = result.pass + 1;
    });
    runner.on('fail', function (test, err) {
      error('fail', err);
      progress('fail', prepareTestResult(test, err));
      result.total = result.total + 1;
      result.fail = result.fail + 1;
    });
    runner.on('hook', function (Evt) {
      Evt.ctx.nemo = nemo;
    });

    runner.on('suite', function (Suite) {
      if (input.profile.reportFile) {
        result.reportFile = input.profile.reportFile;
      }
      log('suite event, suite %s, root: %s', Suite.title, Suite.root);
      anyTests = true;
      if (!(nemo && nemo.driver)) {

        Suite.beforeAll(function checkNemo(_done) {
          Nemo(config).then(function (_nemo) {
            nemo = _nemo;
            nemo.runner = {
              context: input
            };
            _done();
          }).catch(function (err) {
            error(err);
            _done(err);
            if (done) {
              done(result);
            }
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
            log('Suite is ended. Quit driver and call done');
            if (done) {
              done(result);
            }
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
      error('error in defineSuite chain');
      error(err);
      if (done) {
        done(result);
      }
    });
};
