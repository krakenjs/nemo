const Mkdirp = require('mkdirp');
const Fs = require('fs-extra')
const Path = require('path');

module.exports = function scaffold(program) {
  //we need to copy the contents of ../scaffold to <cwd>/<scaffold>
  const src = Path.resolve(__dirname, '../scaffold');
  const dest = Path.resolve(process.cwd(), program.scaffold);
  let times = 1;
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
        1. Add a script to package.json. E.g. "nemo": "nemo -B ${program.scaffold} -P pay,search,form"
        2. Make sure you have latest chrome/chromedriver installed (https://sites.google.com/a/chromium.org/chromedriver/getting-started)
           - The binary should be in your PATH
        3. Run nemo! "npm run nemo"
        4. Learn more: http://nemo.js.org
      `);
    })
  })
};
