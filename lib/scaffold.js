const Mkdirp = require('mkdirp');
const Fs = require('fs-extra');
const Path = require('path');
const promisify = require('util').promisify;
const mkdirpAsync = promisify(Mkdirp);
const copyAsync = promisify(Fs.copy);
const copyFileAsync = promisify(Fs.copyFile);
const writeFileAsync = promisify(Fs.writeFile);

module.exports.complex = function complex(program) {
  // we need to copy the contents of ../scaffold to <cwd>/<scaffold>
  const src = Path.resolve(__dirname, '../scaffold/complex');
  const dest = Path.resolve(process.cwd(), program.scaffoldComplex);
  mkdirpAsync(dest)
    .then(() => copyAsync(src, dest))
    .then(() => {
      console.log(`
  DONE!
  
  Next steps:
  1. Add a script to package.json. E.g. "nemo": "nemo -B ${program.scaffoldComplex} -P pay,search,form -L"
  2. Make sure you have latest chrome/chromedriver installed (https://sites.google.com/a/chromium.org/chromedriver/getting-started)
     - The binary should be in your PATH
  3. Run nemo! "npm run nemo"
  4. Explore the files under ${program.scaffoldComplex}
  5. Learn more: http://nemo.js.org
      `);
    })
    .catch(err => {
      console.error(err);
    });
};

module.exports.simple = function simple(program) {
  // we need to copy the contents of ../scaffold to <cwd>/<scaffold>
  const testSrc = Path.resolve(__dirname, '../scaffold/simple/nemo.test.js');
  const confSrc = require(Path.resolve(__dirname, '../scaffold/simple/nemo.config.js'))(program.scaffold);
  const confDest = Path.resolve(process.cwd(), 'nemo.config.js');
  const testDir = Path.resolve(process.cwd(), program.scaffold);
  const testDest = Path.resolve(process.cwd(), program.scaffold, 'nemo.test.js');

  mkdirpAsync(testDir)
    .then(() => copyFileAsync(testSrc, testDest))
    .then(() => writeFileAsync(confDest, confSrc))
    .then(() => {
      console.log(`
  DONE!
  
  Next steps:
  1. Make sure you have latest chrome/chromedriver installed (https://sites.google.com/a/chromium.org/chromedriver/getting-started)
     - The binary should be in your PATH
  2. Run nemo! "./node_modules/.bin/nemo"
  3. Look at nemo.config.js and ${program.scaffold}/nemo.test.js
  4. Learn more: http://nemo.js.org
      `);
    })
    .catch(err => {
      console.error(err);
    });
};
