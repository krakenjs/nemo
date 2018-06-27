const Mkdirp = require('mkdirp');
const Fs = require('fs-extra')
const Path = require('path');

module.exports.complex = function scaffold(program) {
  // we need to copy the contents of ../scaffold to <cwd>/<scaffold>
  const src = Path.resolve(__dirname, '../scaffold/complex');
  const dest = Path.resolve(process.cwd(), program.scaffoldComplex);
  // let times = 1;
  Mkdirp(dest, err => {
    if (err) {
      return console.error(err);
    }
    Fs.copy(src, dest, err2 => {
      if (err2) {
        return console.error(err2);
      }
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
    });
  });
};

module.exports.simple = function scaffold(program) {
  // we need to copy the contents of ../scaffold to <cwd>/<scaffold>
  const src = Path.resolve(__dirname, '../scaffold/simple');
  const dest = Path.resolve(process.cwd(), program.scaffold);
  // let times = 1;
  Mkdirp(dest, err => {
    if (err) {
      return console.error(err);
    }
    Fs.copy(src, dest, err2 => {
      if (err2) {
        return console.error(err2);
      }
      console.log(`
  DONE!
  
  Next steps:
  1. Add a script to package.json. E.g. "nemo": "nemo -B ${program.scaffold}"
  2. Make sure you have latest chrome/chromedriver installed (https://sites.google.com/a/chromium.org/chromedriver/getting-started)
     - The binary should be in your PATH
  3. Run nemo! "npm run nemo"
  4. Explore the files under ${program.scaffold}
  5. Learn more: http://nemo.js.org
      `);
    });
  });
};
