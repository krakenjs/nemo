'use strict';

var merge = require('lodash.merge');
var debug = require('debug');
var log = debug('nemo:log');
var error = debug('nemo:error');
var filenamify = require('filenamify');
var reporter = require('../lib/reporter');
var Glob = require('glob');
var path = require('path');
var moment = require('moment');


let profile = function profile(cb) {
  var base = this.config.get('profiles:base');
  var profiles = this.program.profile;
  profiles = profiles || 'base';
  profiles = (profiles instanceof Array) ? profiles : [profiles];
  this.instances = [];
  profiles.forEach(function (profil) {
    var conf;
    var instance;
    var profileObj = this.config.get(`profiles:${profil}`);
    log('flow:profile %s', profil);
    if (!profileObj) {
      error('flow:profile, profile %s is undefined', profil);
      return;
    }
    conf = merge({}, base, profileObj || {});
    instance = {
      tags: {profile: profil},
      conf: conf
    };
    this.instances.push(instance);
  }.bind(this));
  cb(null, this);
};

let reportDir = function reportDir(cb) {
  let tsDirName = moment().format("MM-DD-YYYY/HH-mm-ss");
  let fullReportPath = `${this.config.get('profiles:base:reports')}/${tsDirName}`;
  this.config.set('profiles:base:reports', fullReportPath);
  log(`flow:reportDir: ${fullReportPath}`);
  this.instances.forEach(function (instance) {
    instance.conf.reports = fullReportPath;
    log(`flow:reportDir: instance.conf.reports ${instance.conf.reports}`)
  });
  cb(null, this);
};

let grep = function grep(cb) {
  var instances = [];
  var greps = this.program.grep || '';
  greps = (greps instanceof Array) ? greps : [greps];
  log('flow:grep, greps: %s', greps);
  this.instances.forEach(function (instance) {
    greps.forEach(function (gerp) {
      var _instance = merge({}, instance);
      if (gerp !== '') {
        _instance.conf.mocha.grep = gerp;
        _instance.tags.grep = gerp;
      }
      instances.push(_instance);
    });
  });
  this.instances = instances;
  log('flow:grep, #instances: %d', this.instances.length);
  cb(null, this);
};

let glob = function glob(cb) {
  var instances = [];
  this.instances.forEach(function (instance, index, arr) {
    var testFileGlob = path.resolve(this.program.baseDirectory, instance.conf.tests);
    Glob(testFileGlob, {}, function (err, files) {
      var _instance = merge({}, instance);
      log('flow:glob, #files %d', files.length);
      if (err) {
        return cb(err);
      }
      _instance.conf.tests = files;
      instances.push(_instance);
      if (index === arr.length - 1) {
        this.instances = instances;
        log('flow:glob, #instances: %d', this.instances.length);
        cb(null, this);
      }
    }.bind(this));
  }.bind(this));
};

let pfile = function pfile(cb) {
  var base = this.config.get('profiles:base');
  var instances = [];
  if (this.program.file || base.parallel && base.parallel.indexOf('file') !== -1) {
    log('flow:pfile, parallel by file');
    this.instances.forEach(function (instance) {
      var files = instance.conf.tests;
      files.forEach(function (file) {
        var _instance;
        var justFile = file.split(this.program.baseDirectory)[1];
        justFile = filenamify(justFile);
        // remove file ext
        justFile = (justFile.endsWith('.js')) ? justFile.substr(0, justFile.length - 3) : justFile;
        log('flow:pfile, file %s', justFile);
        _instance = merge({}, instance);
        _instance.conf.tests = [file];
        _instance.tags.file = justFile;
        instances.push(_instance);
      }.bind(this));
    }.bind(this));
    this.instances = instances;
  }
  log('flow:pfile, #instances: %d', this.instances.length);
  cb(null, this);
};

let pdata = function pdata(cb) {
  var instances = [];
  var datas = this.config.get('profiles:base:data');
  // var base = this.config.get('profiles:base');

  // if (this.program.data || base.parallel && base.parallel.indexOf('data') !== -1) {
    datas = (typeof datas !== 'object') ? {} : datas;
    log('flow:pdata, parallel by data');
    this.instances.forEach(function (instance) {
      // check for local data
      if (instance.conf.parallel && instance.conf.parallel === 'data') {
        datas = instance.conf.data || datas;
        for (let key in datas) {
          if (Object.prototype.hasOwnProperty.call(datas, key)) {
            let _instance;
            _instance = merge({}, instance);
            _instance.tags.key = key;
            _instance.conf.data = datas[key];
            instances.push(_instance);
          }
        }
      }
      else {
        instances.push(instance);
      }
    });
    this.instances = instances;
  // }
  log('flow:pfile, #instances: %d', this.instances.length);
  cb(null, this);
};

let reportFiles = function reportFiles(cb) {
  log('flow:reportFiles:start');
  let instances = [];
  // let reporterFromConfig = this.config.get('profiles:base:mocha:reporter');
  this.instances.forEach(function (instance) {
    let reporterFromConfig = instance.conf.mocha.reporter;
    // set up reporter options
    if (reporter.hasOwnProperty(reporterFromConfig)) {
      log(`flow:reportFiles: we have a handler for ${reporterFromConfig}`);
      reporter[reporterFromConfig](instance);
    }
    instances.push(instance);
  });
  this.instances = instances;
  cb(null, this);
};

module.exports = [profile, reportDir, grep, glob, pfile, pdata, reportFiles];
