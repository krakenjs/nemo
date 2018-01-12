const CircularJSON = require('circular-json');
var Influx = require('influx');
var debug = require('debug');
var log = debug('nemo:storage:log');
var errord = debug('nemo:storage:error');

let Storage = function (prefontaine) {
  this.prefontaine = prefontaine;
  if (!prefontaine.config.get('output:storage')) {
    log('no storage requested');
    return;
  }
  this.masterID = prefontaine.masterID;
  this.influx = new Influx.InfluxDB({
    host: prefontaine.config.get('output:storage:server'),
    database: prefontaine.config.get('output:storage:database'),
    schema: [
      {
        measurement: 'test',
        fields: {
          result: Influx.FieldType.STRING,
          error: Influx.FieldType.STRING,
          stack: Influx.FieldType.STRING,
          fullTitle: Influx.FieldType.STRING,
          duration: Influx.FieldType.INTEGER,
          threadID: Influx.FieldType.STRING,
          masterID: Influx.FieldType.STRING
        },
        tags: [
          'title',
          'profile',
          'dkey',
          'file',
          'grep'
        ]

      },
      {
        measurement: 'lifecycle',
        fields: {
          event: Influx.FieldType.STRING,
          threadID: Influx.FieldType.STRING,
          masterID: Influx.FieldType.STRING,
          duration: Influx.FieldType.INTEGER
        },
        tags: [
          'profile',
          'dkey',
          'grep'
        ]

      }
    ]
  });
};

Storage.prototype.test = function (result) {
  if (!this.prefontaine.config.get('output:storage')) {
    log('no storage requested');
    return;
  }
  result.test = CircularJSON.parse(result.test);
  log(`store test ${result.test.fullTitleString}, status "${result.type}" with tags ${result.tags}`);
  let title, fullTitle, duration, threadID, profile, dkey, file, grep, type, masterID, error, stack;
  masterID = this.masterID;
  type = result.type || '_blank_';
  title = result.test.title || '_blank_';
  fullTitle = result.test.fullTitleString || '_blank_';
  duration = result.test.duration || -1;
  threadID = result.tags.uid;
  profile = result.tags.profile || '_blank_';
  dkey = result.tags.key || '_blank_';
  file = result.tags.file || '_blank_';
  grep = result.tags.grep || '_blank_';
  error = result.test.err;
  stack = result.test.stack;

  this.influx.writePoints([
    {
      measurement: 'test',
      tags: { title,
        grep,
        profile,
        dkey,
        file },
      fields: { result: type, fullTitle, duration, error, stack, threadID, masterID}
    }
  ]).catch(err => {
    errord(`Error saving data to InfluxDB! ${err.stack}`);
  });
};

Storage.prototype.lifecycle = function (result) {
  if (!this.prefontaine.config.get('output:storage')) {
    log('no storage requested');
    return;
  }
  log(`store lifecycle event ${result.event}`);
  let duration, masterID, threadID, profile, dkey, grep, event;
  event = result.event || '_blank_';
  duration = result.duration || -1;
  masterID = this.masterID;
  threadID = result.tags.uid;
  profile = result.tags.profile || '_blank_';
  dkey = result.tags.key || '_blank_';
  grep = result.tags.grep || '_blank_';

  this.influx.writePoints([
    {
      measurement: 'lifecycle',
      tags: {
        grep,
        profile,
        dkey
      },
      fields: { event, duration, threadID, masterID }
    }
  ]).catch(err => {
    errord(`Error saving data to InfluxDB! ${err.stack}`);
  });
};

module.exports = Storage;
