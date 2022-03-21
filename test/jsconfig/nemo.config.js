const path = require('path');
module.exports = {
  data: {
    foo: 'bar'
  },
  plugins: {
    view: {
      module: 'nemo-view',
      arguments: [path.join(__dirname, '../locator')]
    }
  },
  output: {
    reports: path.join(__dirname, '../report')
  },
  profiles: {
    base: {
      tests: path.join(__dirname, '../nested*.js'),
      driver: require(path.join(__dirname, '../config/driverconfig.chrome')),
      mocha: {
        timeout: 180000,
        reporter: 'mochawesome'
      },
      data: {
        baseUrl: 'https://www.google.com'
      }
    }
  }
};
