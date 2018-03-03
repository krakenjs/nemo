var addContext = require('mochawesome/addContext');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var debug = require('debug');
var log = debug('nemo:screenshot:log');
var error = debug('nemo:screenshot:error');
var filenamify = require('filenamify');


module.exports.setup = (nemo, cb) => {
  log('setup is called');
  nemo.snap = function () {
    var imagePath = arguments[0];
    var screenshotName;
    if (!imagePath && !nemo.runner.context.profile.conf.reports) {
      error('Trying to capture a screenshot with no path');
      return Promise.resolve();
    }
    if (!imagePath) {
      log(`snap for test ${nemo.mocha.test.title}`);
      nemo.mocha.test.__screenshot = (nemo.mocha.test.__screenshot) ? (nemo.mocha.test.__screenshot + 1) : 1;

      screenshotName = `${filenamify(nemo.mocha.test.title)}.${nemo.mocha.test.__screenshot}.png`;
      imagePath = `${nemo.runner.context.profile.conf.reports}/${screenshotName}`;
    }
    return nemo.driver.takeScreenshot()
      .then(function (img) {
        let pFunk;
        let p = new Promise((resolve, reject) => {
          pFunk = {resolve, reject};
        });
        log(`afterEach: got the screenshot, ${imagePath}`);
        mkdirp.sync(path.dirname(imagePath));

        // save screen image
        fs.writeFile(imagePath, img, {
          'encoding': 'base64'
        }, function (err) {
          if (err) {
            pFunk.reject(err);
          } else {
            if (!screenshotName) {
              screenshotName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
            }
            // addContext only applicable for mochawesome reports
            addContext(nemo.mocha, screenshotName);
            pFunk.resolve(true);
          }
        });
        return p;
      })
      .catch(function (err) {
        error(`triggered error block: ${err}`);
      });
  };
  cb(null);
};
