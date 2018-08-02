var table = require('cli-table');
var util = require('./util');
module.exports = function (context, _instances) {
  let output = util.formatSummary(_instances);
  let tabl = new table({
    head: ['tags', 'pass', 'fail', 'total']
  });
  output.instances.forEach(function (instance) {
    let tags = '';
    Object.keys(instance.tags).forEach(function (key) {
      if (key === 'uid') {
        return;
      }
      tags += `${key}: ${instance.tags[key]}\n`;
    });
    tabl.push([tags, instance.summary.pass, instance.summary.fail, instance.summary.total]);
  });
  tabl.push(['TOTALS', output.totals.pass, output.totals.fail, output.totals.total]);
  console.log(tabl.toString());
  process.exitCode = Math.min(output.totals.fail, 255);
  if (context.program.exit) {
    process.exit();
  }
};
