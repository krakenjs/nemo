var Table = require('cli-table');
var util = require('../../../lib/util');

module.exports = [{
  type: 'master:end',
  listener: function (context, _instances) {
    let output = util.formatSummary(_instances);
    let tabl = new Table({
      head: ['tags', 'pass', 'fail', 'total']
    });
    output.instances.forEach(function (instance) {
      let tags = '';
      Object.keys(instance.tags).forEach(function (key) {
        if (key === 'uid') {
          return;
        }
        tags = tags + `${key}: ${instance.tags[key]}\n`;
      });
      tabl.push([tags, instance.summary.pass, instance.summary.fail, instance.summary.total]);
    });
    tabl.push(['TOTALS', output.totals.pass, output.totals.fail, output.totals.total]);
    console.log(tabl.toString());
    
    let zeroExitCode = context.config.get('profiles:base:zeroExitCode') || false
    process.exitCode = zeroExitCode ? 0 : Math.min(output.totals.fail, 255);
    if (context.program.exit) {
      process.exit();
    }
  }
}];

