module.exports = dest => {
  return `const path = require('path');

module.exports = {
  plugins: {
    view: {
      module: 'nemo-view'
    }
  },
  output: {
    reports: path.resolve('${dest}', 'report')
  },
  profiles: {
    base: {
      tests: path.resolve('${dest}', '*test.js'),
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
`}
