'use strict';

const merge = require('lodash.merge');
const omit = require('lodash.omit');
const debug = require('debug');
const log = debug('nemo:flow:log');
const filenamify = require('filenamify');
const reporter = require('../lib/reporter');
const Glob = require('glob');
const path = require('path');
const moment = require('moment');

const profile = function profile(cb) {
  let base = this.config.get('profiles:base');
  let profiles = this.program.profile;
  profiles = profiles || 'base';
  profiles = (profiles instanceof Array) ? profiles : [profiles];
  this.instances = [];
  profiles.forEach(function (profil) {
    let conf;
    let instance;
    let profileObj = this.config.get(`profiles:${profil}`);
    log('profile %s', profil);
    if (!profileObj) {
      console.error('profile, profile %s is undefined', profil);
      return;
    }

    // don't merge data objects here
    conf = merge({}, omit(base, 'data'), profileObj || {});

    // set baseConfigPath for use by the runner when nemo is instantiated again
    conf.baseConfigPath = this.config.get('baseConfigPath');
    instance = {
      tags: {profile: profil},
      conf: conf
    };
    this.instances.push(instance);
  }.bind(this));
  cb(null, this);
};

const reportDir = function reportDir(cb) {
  let reportOutput = this.config.get('output:reports');
  if (!reportOutput) {
    log('reportDir: output:reports not defined');
    return cb(null, this);
  }
  let tsDirName = moment().format('MM-DD-YYYY/HH-mm-ss');
  let fullReportPath = `${reportOutput}/${tsDirName}`;
  this.config.set('output:reports', fullReportPath);
  log(`reportDir: ${fullReportPath}`);
  this.instances.forEach(function (instance) {
    instance.conf.reports = fullReportPath;
    instance.conf.reportsBase = reportOutput;
    log(`reportDir: instance.conf.reports ${instance.conf.reports}`);
  });
  cb(null, this);
};

const grep = function grep(cb) {
  let instances = [];
  let greps = this.program.grep || '';
  greps = (greps instanceof Array) ? greps : [greps];
  log('grep, greps: %s', greps);
  this.instances.forEach(function (instance) {
    greps.forEach(function (gerp) {
      let _instance = merge({}, instance);
      if (gerp !== '') {
        _instance.conf.mocha.grep = gerp;
        _instance.tags.grep = gerp;
      }
      instances.push(_instance);
    });
  });
  this.instances = instances;
  log('grep, #instances: %d', this.instances.length);
  cb(null, this);
};

const glob = function glob(cb) {
  let instances = [];
  this.instances.forEach(function (instance, index, arr) {
    let testFileGlob = path.resolve(this.program.baseDirectory, instance.conf.tests);
    Glob(testFileGlob, {}, function (err, files) {
      log('glob, #files %d', files.length);
      if (err) {
        return cb(err);
      }
      let _instance = merge({}, instance);
      _instance.conf.tests = files;
      instances.push(_instance);
      if (index === arr.length - 1) {
        this.instances = instances;
        log('glob, #instances: %d', this.instances.length);
        cb(null, this);
      }
    }.bind(this));
  }.bind(this));
};

const removeFileExtension = filename => filename.endsWith('.js') ? filename.substr(0, filename.length - 3) : filename;

const pfile = function pfile(cb) {
  let base = this.config.get('profiles:base');
  let instances = [];
  if (this.program.file || base.parallel && base.parallel.indexOf('file') !== -1) {
    log('pfile, parallel by file');
    this.instances.forEach(function (instance) {
      let files = instance.conf.tests;
      files.forEach(function (file) {
        let _instance;
        let justFile = file.split(this.program.baseDirectory)[1];
        justFile = removeFileExtension(filenamify(justFile));
        log('pfile, file %s', justFile);
        _instance = merge({}, instance);
        _instance.conf.tests = [file];
        _instance.tags.file = justFile;
        instances.push(_instance);
      }.bind(this));
    }.bind(this));
    this.instances = instances;
  }
  log('pfile, #instances: %d', this.instances.length);
  cb(null, this);
};

const pdata = function pdata(cb) {
  let instances = [];
  let baseData = this.config.get('profiles:base:data');
  // let base = this.config.get('profiles:base');

  // if (this.program.data || base.parallel && base.parallel.indexOf('data') !== -1) {
  baseData = (typeof baseData !== 'object') ? {} : baseData;
  log('pdata, parallel by data %j', baseData);
  this.instances.forEach(function (instance) {
    // check for local data
    if ((instance.conf.parallel && instance.conf.parallel === 'data') || this.program.data) {
      let instanceData = instance.conf.data || baseData;
      log('parent instance data is %j', instanceData);

      for (let key in instanceData) {
        if (Object.prototype.hasOwnProperty.call(instanceData, key)) {
          let _instance;
          _instance = merge({}, instance);
          _instance.tags.key = key;
          _instance.conf.data = merge({}, baseData, instanceData[key]);
          instances.push(_instance);
          log('child instance data is %j', _instance.conf.data);
        }
      }
    } else {
      log('child instance data is %j', instance.conf.data);
      log('child base data is %j', instance.conf.data);

      instance.conf.data = merge({}, baseData, instance.conf.data || {});
      log('instance.conf.data is %j', instance.conf.data);

      instances.push(instance);
    }
  }.bind(this));
  this.instances = instances;
  // }
  log('pfile, #instances: %d', this.instances.length);
  cb(null, this);
};

const setupReporterOptions = (self, instance) => {
  let reporterFromConfig = instance.conf.mocha.reporter;
  if (reporter.hasOwnProperty(reporterFromConfig)) {
    log(`reportFiles: we have a handler for ${reporterFromConfig}`);
    reporter[reporterFromConfig](self, instance);
  }
  return instance;
};

const reportFiles = function reportFiles(cb) {
  log('reportFiles:start');
  this.instances = this.instances.map(function (instance) {
    return setupReporterOptions(this, instance);
  }.bind(this));
  cb(null, this);
};

/* These functions get flow.map(fn => fn.bind(Nemo)) in nemo.js */
module.exports = [profile, reportDir, grep, glob, pfile, pdata, reportFiles];
