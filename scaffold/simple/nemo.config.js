const path = require('path');

module.exports = {
  plugins: {
    view: {
      module: 'nemo-view'
    }
  },
  output: {
    reports: path.resolve(__dirname, 'report')
  },
  profiles: {
    base: {
      tests: path.resolve(__dirname, '*test.js'),
      driver: {
        browser: 'chrome'
      },
      data: {
        baseUrl: 'https://www.google.com'
      },
      mocha: {
        timeout: 180000,
        reporter: 'mochawesome',
        reporterOptions: {
          quiet: true
        }
      }
    }
  }
}
