var debug = require('debug');
var log = debug('nemo:log');
var filenamify = require('filenamify');

// var error = debug('nemo:error');

module.exports.mochawesome = function mochawesome(instance) {
  log(`reporter:mochawesome: start: %O`, instance.conf.mocha);
  let instanceLabel = '';
  for (let tag in instance.tags) {
    if (instance.tags.hasOwnProperty(tag)) {
      instanceLabel += `:${tag}:${instance.tags[tag]}:`;
    }
  }
  instance.conf.reports = `${instance.conf.reports}/${filenamify(instanceLabel)}`;
  let reporterOptions = {
    reportDir: instance.conf.reports,
    reportFilename: 'nemo-report'
  };
  instance.reportFile = `${instance.conf.reports}/nemo-report.html`;
  instance.conf.mocha.reporterOptions = Object.assign({}, instance.conf.mocha.reporterOptions, reporterOptions);
};

module.exports.xunit = function (instance) {
  log(`reporter:xunit: start: %O`, instance.conf.mocha);
  let instanceLabel = '';
  for (let tag in instance.tags) {
    if (instance.tags.hasOwnProperty(tag)) {
      instanceLabel += `:${tag}:${instance.tags[tag]}:`;
    }
  }
  instance.conf.reports = filenamify.path(`${instance.conf.reports}/${instanceLabel}`);
  if (instance.conf.mocha.reporterOptions && instance.conf.mocha.reporterOptions.output) {
    let reporterOptions = {
      output: `${instance.conf.reports}/nemo-report.xml`
    };
    instance.reportFile = `${instance.conf.reports}/nemo-report.xml`;
    instance.conf.mocha.reporterOptions = Object.assign({}, instance.conf.mocha.reporterOptions, reporterOptions);
  }
};