module.exports.formatSummary = function formatSummary(_instances) {
  let instances = _instances.map(instance => Object.assign({}, instance));
  let totals = {total: 0, pass: 0, fail: 0};
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
  // slim this down for summary purposes
  instances.forEach(instance => delete instance.testResults);
  return {totals, instances};
};
