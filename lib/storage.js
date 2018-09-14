var Influx = require('influx');
var debug = require('debug');
var log = debug('nemo:storage:log');

let Storage = function (Nemo) {
  this.configuration = Nemo;
  if (!Nemo.config.get('output:storage')) {
    log('no storage requested');
    return;
  }
  this.masterID = Nemo.masterID;
  this.influx = new Influx.InfluxDB({
    host: Nemo.config.get('output:storage:server'),
    database: Nemo.config.get('output:storage:database'),
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

  // attach listeners
  this.listeners.forEach(listener => {
    Nemo.emitter.on(listener.type, listener.listener);
  });
};

Storage.prototype.test = function (result) {
  if (!this.configuration.config.get('output:storage')) {
    log('no storage requested');
    return;
  }
  log(`store test ${result.test.fullTitleString}, status "${result.type}" with tags ${result.tags}`);
  let masterID = this.masterID;
  let title = result.test.title || '_blank_';
  let fullTitle = result.test.fullTitleString || '_blank_';
  let duration = result.test.duration || -1;
  let threadID = result.tags.uid;
  let profile = result.tags.profile || '_blank_';
  let dkey = result.tags.key || '_blank_';
  let file = result.tags.file || '_blank_';
  let grep = result.tags.grep || '_blank_';
  let error = result.test.errSafe && result.test.errSafe.name;
  let stack = result.test.errSafe && result.test.errSafe.stack;
  let status = result.test.state;

  this.influx.writePoints([
    {
      measurement: 'test',
      tags: {
        title,
        grep,
        profile,
        dkey,
        file
      },
      fields: {result: status, fullTitle, duration, error, stack, threadID, masterID}
    }
  ]).catch(err => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`);
  });
};

Storage.prototype.lifecycle = function (event, result) {
  if (!this.configuration.config.get('output:storage')) {
    log('no storage requested');
    return;
  }
  log(`store lifecycle event ${event}`);
  let duration = result.duration || -1;
  let masterID = this.masterID;
  let threadID = result.tags.uid;
  let profile = result.tags.profile || '_blank_';
  let dkey = result.tags.key || '_blank_';
  let grep = result.tags.grep || '_blank_';

  this.influx.writePoints([
    {
      measurement: 'lifecycle',
      tags: {
        grep,
        profile,
        dkey
      },
      fields: {event, duration, threadID, masterID}
    }
  ]).catch(err => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`);
  });
};

Storage.prototype.listeners = [{
  type: 'test',
  listener: (context, event) => {
    context.storage.test(event);
  }
}, {
  type: 'instance:start',
  listener: (context, event) => {
    context.storage.lifecycle('start', event);
  }
}, {
  type: 'instance:end',
  listener: (context, event) => {
    context.storage.lifecycle('end', event);
  }
}];

module.exports = Storage;
