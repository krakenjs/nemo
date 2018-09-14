const addContext = require('mochawesome/addContext');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');
const debug = require('debug');
const log = debug('nemo:screenshot:log');
const filenamify = require('filenamify');


module.exports.setup = (nemo, cb) => {
  nemo.snap = function (filename) {
    let reportPath = nemo.runner.reportPath;
    if (!nemo.runner || !nemo.runner.reportPath) {
      console.error('Trying to initialize screenshot plugin with no path');
      return Promise.resolve();
    }
    log(`snap for test ${nemo.mocha.test.title}`);
    nemo.mocha.test.__screenshot = (nemo.mocha.test.__screenshot) ? (nemo.mocha.test.__screenshot + 1) : 1;
    let screenshotName = (filename) ? `${filename}.png` : `${filenamify(nemo.mocha.test.title)}.${nemo.mocha.test.__screenshot}.png`;
    reportPath = `${reportPath}/${screenshotName}`;
    return nemo.driver.takeScreenshot()
      .then(function (img) {
        let pFunk;
        let p = new Promise((resolve, reject) => {
          pFunk = {resolve, reject};
        });
        log(`afterEach: got the screenshot, ${reportPath}`);
        mkdirp.sync(path.dirname(reportPath));

        // save screen image
        fs.writeFile(reportPath, img, {
          encoding: 'base64'
        }, function (err) {
          if (err) {
            pFunk.reject(err);
          } else {
            if (!screenshotName) {
              screenshotName = reportPath.substr(reportPath.lastIndexOf('/') + 1);
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
