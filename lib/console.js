var Table = require('cli-table');
var util = require('./util');

function getTableRows(output) {
  return output.instances.map(function (instance) {
    const tags = Object.keys(instance.tags)
      .filter(key => key !== 'uid')
      .reduce(function (acc, key) {
        return acc + `${key}: ${instance.tags[key]}\n`;
      }, '');

    return [tags, instance.summary.pass, instance.summary.fail, instance.summary.total];
  });
}

module.exports = function (context, instances) {
  const output = util.formatSummary(instances);
  const table = new Table({head: ['tags', 'pass', 'fail', 'total']});
  table.push(...getTableRows(output));
  table.push(['TOTALS', output.totals.pass, output.totals.fail, output.totals.total]);
  console.log(table.toString());
  process.exitCode = Math.min(output.totals.fail, 255);
  if (context.program.exit) {
    process.exit();
  }
};
