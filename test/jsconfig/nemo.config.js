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
      mocha: {
        timeout: 180000,
        reporter: 'mochawesome'
      },
      data: {
        baseUrl: 'https://www.google.com'
      },
      driver: {
        builders: {
          withCapabilities: [
            {
              browserName: 'chrome',
              chromeOptions: {
                args: [
                  'headless',
                  'window-size=1200,800',
                  'disable-dev-shm-usage'
                ]
              }

            }
          ]
        }
      }
    }
  }
};
