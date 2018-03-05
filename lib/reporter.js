var debug = require('debug');
var log = debug('nemo:reporter:log');
var filenamify = require('filenamify');

// TODO is there some way to not have any of these? Can we just assign all configuration props
// as arguments and then just let the user figure it out?
// We can avoiding needing to support new props as reporters evolve.
module.exports.mochawesome = function mochawesome(instance) {
  if (!instance.conf.reports) {
    log('mochawesome: output.reports was not defined. Fallback to manual mochawesome config');
    return;
  }
  let assetsDir = `${instance.conf.reportsBase}/mochawesomeAssets`;
  log(`mochawesome: start: %O`, instance.conf.mocha);
  let instanceLabel = '';
  for (let tag in instance.tags) {
    if (instance.tags.hasOwnProperty(tag)) {
      instanceLabel += `:${tag}:${instance.tags[tag]}:`;
    }
  }
  instance.conf.reports = `${instance.conf.reports}/${filenamify(instanceLabel)}`;
  let reporterOptions = {
    reportDir: instance.conf.reports,
    reportFilename: 'nemo-report',
    assetsDir: assetsDir
  };
  instance.reportFile = `${instance.conf.reports}/nemo-report.html`;
  instance.conf.mocha.reporterOptions = Object.assign({}, instance.conf.mocha.reporterOptions, reporterOptions);
};

module.exports.xunit = function (instance) {
  if (!instance.conf.reports) {
    log('xunit: output.reports was not defined. Fallback to manual xunit config');
    return;
  }
  log(`xunit: start`);
  let instanceLabel = '';
  for (let tag in instance.tags) {
    if (instance.tags.hasOwnProperty(tag)) {
      instanceLabel += `:${tag}:${instance.tags[tag]}:`;
    }
  }
  instance.conf.reports = filenamify.path(`${instance.conf.reports}/${instanceLabel}`);
  let reporterOptions = {
    output: `${instance.conf.reports}/nemo-report.xml`
  };
  instance.reportFile = `${instance.conf.reports}/nemo-report.xml`;
  instance.conf.mocha.reporterOptions = Object.assign({}, instance.conf.mocha.reporterOptions, reporterOptions);
  log(`xunit: config: %O`, instance.conf.mocha);
};

module.export.generateDefaultReport = function () {
  /**
   * I'll go ahead and move the html/css of my reporter into this repo. We'll
   * import it here, and create a report. The template pieces of the reporter
   * could easily be used for the web server component as well.
   */

  // return early if they're using a custom reporter
  // makeReport('dirname and stuff')
};


