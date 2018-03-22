var addContext = require('mochawesome/addContext');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var debug = require('debug');
var log = debug('nemo:screenshot:log');
var filenamify = require('filenamify');


module.exports.setup = (defaultPath, nemo, cb) => {
  log('setup is called with defaultPath %s', defaultPath);
  nemo.snap = function () {
    var overridePath = arguments[0];
    var screenshotName;
    if (!overridePath && !defaultPath) {
      console.error('Trying to capture a screenshot with no path');
      return Promise.resolve();
    }
    if (!overridePath) {
      log(`snap for test ${nemo.mocha.test.title}`);
      nemo.mocha.test.__screenshot = (nemo.mocha.test.__screenshot) ? (nemo.mocha.test.__screenshot + 1) : 1;

      screenshotName = `${filenamify(nemo.mocha.test.title)}.${nemo.mocha.test.__screenshot}.png`;
      overridePath = `${defaultPath}/${screenshotName}`;
    }
    return nemo.driver.takeScreenshot()
      .then(function (img) {
        let pFunk;
        let p = new Promise((resolve, reject) => {
          pFunk = {resolve, reject};
        });
        log(`afterEach: got the screenshot, ${overridePath}`);
        mkdirp.sync(path.dirname(overridePath));

        // save screen image
        fs.writeFile(overridePath, img, {
          'encoding': 'base64'
        }, function (err) {
          if (err) {
            pFunk.reject(err);
          } else {
            if (!screenshotName) {
              screenshotName = overridePath.substr(overridePath.lastIndexOf('/') + 1);
            }
            // addContext only applicable for mochawesome reports
            addContext(nemo.mocha, screenshotName);
            pFunk.resolve(true);
          }
        });
        return p;
      })
      .catch(function (err) {
        console.error(`triggered error block: ${err}`);
      });
  };
  cb(null);
};
