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
const {getCommonPathStart} = require('common-path-start');

const profile = function profile(cb) {
  let base = this.config.get('profiles:base');
  base.plugins = this.config.get('plugins') || {};
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
      let _instance = merge({}, instance);
      log('glob, #files %d', files.length);
      if (err) {
        return cb(err);
      }
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

const pfile = function pfile(cb) {
  let base = this.config.get('profiles:base');
  let instances = [];
  if (this.program.file || base.parallel && base.parallel.indexOf('file') !== -1) {
    log('pfile, parallel by file');
    this.instances.forEach(function (instance) {
      let files = instance.conf.tests;
      let commonPathStart = getCommonPathStart(files);
      files.forEach(function (file) {
        let _instance;
        let justFile = filenamify(file.substr(commonPathStart.length));
        // remove file ext
        justFile = (justFile.endsWith('.js')) ? justFile.substr(0, justFile.length - 3) : justFile;
        log('pfile, file %s', justFile);
        _instance = merge({}, instance);
        _instance.conf.tests = [file];
        _instance.tags.file = justFile;
        instances.push(_instance);
      });
    });
    this.instances = instances;
  }
  log('pfile, #instances: %d', this.instances.length);
  cb(null, this);
};

const pdata = function pdata(cb) {
  let instances = [];
  let rootData = this.config.get('data') || {};
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
          // only merge "base" data if this isn't the "base" profile
          let mergeData = (instance.tags.profile === 'base') ? {} : baseData;
          _instance = merge({}, instance);
          _instance.tags.key = key;
          _instance.conf.data = merge({}, rootData, mergeData, instanceData[key]);
          instances.push(_instance);
          log('child instance data is %j', _instance.conf.data);
        }
      }
    } else {
      log('child instance data is %j', instance.conf.data);
      log('child base data is %j', instance.conf.data);

      instance.conf.data = merge({}, rootData, baseData, instance.conf.data || {});
      log('instance.conf.data is %j', instance.conf.data);

      instances.push(instance);
    }
  }.bind(this));
  this.instances = instances;
  // }
  log('pfile, #instances: %d', this.instances.length);
  cb(null, this);
};

const reportFiles = function reportFiles(cb) {
  log('reportFiles:start');
  let instances = [];
  // let reporterFromConfig = this.config.get('profiles:base:mocha:reporter');
  this.instances.forEach(function (instance) {
    let reporterFromConfig = instance.conf.mocha.reporter;
    // set up reporter options
    if (reporter.hasOwnProperty(reporterFromConfig)) {
      log(`reportFiles: we have a handler for ${reporterFromConfig}`);
      reporter[reporterFromConfig](this, instance);
    }
    instances.push(instance);
  }.bind(this));
  this.instances = instances;
  cb(null, this);
};

module.exports = [profile, reportDir, grep, glob, pfile, pdata, reportFiles];
