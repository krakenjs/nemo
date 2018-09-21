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
    count: 4,
    description: 'master level run folders'
  }, {
    glob: '*/*/summary.json',
    count: 4,
    description: 'instance level summary.json files'
  }, {
    glob: '*/*/*/',
    count: 11,
    description: 'instance level run folders'
  },  {
    glob: '*/*/*/nemo-report*',
    count: 22,
    description: 'instance level nemo-report* files'
  }, {
    glob: '*/*/*/*.png',
    count: 10,
    description: 'screen capture png files'
  }];
  assertions.forEach(assertion => {
    console.log(`verifying ${assertion.count} ${assertion.description}`);
    glob(assertion.glob, {cwd: reportPath}, (err, results) => {
      if (err) {
        console.error(`problem verifying ${assertion.description}`);
        console.error(err);
        process.exit(1);
      }
      assert.equal(results.length, assertion.count);
    });
  });
}
