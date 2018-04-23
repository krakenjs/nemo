const path = require('path');
const assert = require('assert');
const minimist = require('minimist');

module.exports = function () {
  // run tests if running nemo:dynamic npm script
  var argv = minimist(process.argv.slice(2));
  if(argv['url-from-cli']) {
    assert.equal(argv.U, true, '-U not specified as expected');
    assert.equal(argv['url-from-cli'], 'https://www.wikipedia.org', 'urlFromCli should equal to https://www.wikipedia.org');
  }

  return {
    tests: path.resolve(__dirname, '../dynamic.js'),
    data: {
      urlFromCli: argv['url-from-cli']
    }
  };
};