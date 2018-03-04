'use strict';

var spawn = require('threads').spawn;
var instance = require('../lib/instance');
var debug = require('debug');
var parallelLimit = require('async/parallelLimit');
var uuid = require('uuid/v4');
var log = debug('nemo:master:log');
var error = debug('nemo:master:error');
var fs = require('fs');
var table = require('cli-table');

module.exports = function master() {
  var results = [];
  var complete = 0;
  var iconfig;
  var tasks;
  var maxConcurrent;
  const progress = function (type, result) {
    this.emitter.emit(type, this, result);
    log(`call progress with event: ${type}`);
  }.bind(this);

  if (this.instances.length === 1 && !this.program.fromServer) {


    iconfig = this.instances[0];

    log('single kickoff with instance %O', iconfig.tags);
    // TODO: below doesn't impact debuglogs of modules already loaded
    process.env = Object.assign({}, process.env, iconfig.conf.env || {});
    iconfig.tags.uid = uuid();
    return instance({basedir: this.program.baseDirectory, profile: iconfig, __dirname: __dirname}, null, progress);
  }
  // parallel use case
  tasks = this.instances.map(function (iconf) {

    return function (done) {
      var thread = spawn(instance, {env: Object.assign({}, process.env, iconf.conf.env || {})});
      iconf.tags.uid = uuid();
      log('multi kickoff with instance %O', iconf.tags);
      thread
        .send({basedir: this.program.baseDirectory, profile: iconf, __dirname: __dirname})
        // The handlers come here: (none of them is mandatory)
        .on('message', function (summary) {
          log('Thread complete', summary);
          if (summary) {
            results.push(summary);
          }
          thread.kill();
        })
        .on('progress', progress)
        .on('error', function (er) {
          error(er);
          thread.kill();
        })
        .on('exit', function () {
          var totals;
          complete = complete + 1;
          log(`Thread exited. ${complete}/${this.instances.length}`);
          thread.removeAllListeners('message');
          thread.removeAllListeners('error');
          thread.removeAllListeners('exit');
          if (complete === this.instances.length) {
            totals = {total: 0, pass: 0, fail: 0};
            log('Everything done, shutting down the thread pool.');
            results.forEach(function (result) {
              totals.total = totals.total + result.total;
              totals.pass = totals.pass + result.pass;
              totals.fail = totals.fail + result.fail;
            });

            let summary = JSON.stringify({
              iterations: results,
              summary: totals
            }, null, '\t')
            let tabl = new table({
              head: ['tags', 'pass', 'fail', 'total', 'report']
            });
            results.forEach(function (iter) {
              let tags = '';
              Object.keys(iter.tags).forEach(function (key) {
                if (key === 'uid') {
                  return;
                }
                tags += `${key}: ${iter.tags[key]}\n`;
              });
              tabl.push([tags, iter.pass, iter.fail, iter.total, iter.reportFile || '']);
            });
            tabl.push(['TOTALS', totals.pass, totals.fail, totals.total]);
            /* eslint-disable */
            console.log(tabl.toString());
            /* eslint-enable */

            this.emitter.emit('master:end', this, summary);
            if (this.config.get('output:reports')) {
              fs.writeFileSync(`${this.config.get('output:reports')}/summary.json`, summary);
            }
          }
          done();
        }.bind(this));
    }.bind(this);
  }.bind(this));

  maxConcurrent = this.config.get('profiles:base:maxConcurrent') || Infinity;
  parallelLimit(tasks, maxConcurrent);
};
