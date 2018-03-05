var table = require('cli-table');

module.exports = [{
  type: 'test',
  listener: (context, event) => {
    console.log(`user event listener: test ${event.test.title} status: ${event.test.state}`);
  }
}, {
  type: 'master:end',
  listener: (context, instances) => {
    let totals = {total: 0, pass: 0, fail: 0};
    console.log('master:end');
    instances.forEach(instance => {
      instance.testResults.forEach(test => {
        totals.total = totals.total + 1;
        totals.pass = (test.state === 'passed') ? totals.pass + 1 : totals.pass;
        totals.fail = (test.state === 'failed') ? totals.fail + 1 : totals.fail;
      });
    });
    // console.log(instances[0].testResults);
    // instances.testResults.forEach(function (test) {
    //   // var summary = instance.summary
    //   // totals.total = totals.total + summary.total;
    //   // totals.pass = totals.pass + summary.pass;
    //   // totals.fail = totals.fail + summary.fail;
    //   console.log(test);
    // });
    console.log(totals);
  }
}];
