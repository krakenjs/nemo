const path = require('path');
const reportPath = path.resolve(__dirname, 'report');
const rmrf = require('rimraf');
const glob = require('glob');
const assert = require('assert');

// we are either cleaning report directory, or verifying files/types in the report directory
if (process.argv[2] === 'clean') {
  rmrf(reportPath, err => {
    if (err) {
      return console.error(err);
    }
    console.log('deleted report directory');
  });
}
else if (process.argv[2] === 'verify') {
  let assertions = [{
    glob: '*/*/',
    count: 6,
    description: 'master level run folders'
  }, {
    glob: '*/*/summary.json',
    count: 6,
    description: 'instance level summary.json files'
  }, {
    glob: '*/*/*/',
    count: 13,
    description: 'instance level run folders'
  },  {
    glob: '*/*/*/nemo-report*',
    count: 26,
    description: 'instance level nemo-report* files'
  }, {
    glob: '*/*/*/*.png',
    count: 18,
    description: 'screen capture png files'
  }];
  assertions.forEach(assertion => {
    glob(assertion.glob, {cwd: reportPath}, (err, results) => {
      console.log(`verifying ${assertion.count} ${assertion.description}`);
      if (err) {
        console.error(`glob error for ${assertion.description}`);
        console.error(err);
        process.exit(1);
      }
      assert.equal(results.length, assertion.count);
    });
  });
}
