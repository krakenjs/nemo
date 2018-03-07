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
      let instanceSummary = {total: 0, pass: 0, fail: 0};
      instance.testResults.forEach(test => {
        instanceSummary.total = instanceSummary.total + 1;
        instanceSummary.pass = (test.state === 'passed') ? instanceSummary.pass + 1 : instanceSummary.pass;
        instanceSummary.fail = (test.state === 'failed') ? instanceSummary.fail + 1 : instanceSummary.fail;
      });
      instance.summary = instanceSummary;
      totals.total = totals.total + instanceSummary.total;
      totals.pass = totals.pass + instanceSummary.pass;
      totals.fail = totals.fail + instanceSummary.fail;
    });
    console.log(totals);
    let tabl = new table({
      head: ['tags', 'pass', 'fail', 'total', 'report']
    });
    instances.forEach(function (instance) {
      let tags = '';
      Object.keys(instance.tags).forEach(function (key) {
        if (key === 'uid') {
          return;
        }
        tags += `${key}: ${instance.tags[key]}\n`
      });
      tabl.push([tags, instance.summary.pass, instance.summary.fail, instance.summary.total, instance.reportFile || '']);
    });
    tabl.push(['TOTALS', totals.pass, totals.fail, totals.total]);
    console.log(tabl.toString());
  }
}];
