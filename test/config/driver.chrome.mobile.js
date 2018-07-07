'use strict';

const {Builder} = require('selenium-webdriver');
const {Options} = require('selenium-webdriver/chrome');

module.exports = function () {
  let copts = new Options().setMobileEmulation({deviceName: 'Nexus 5X'});
  console.log(copts);
  let driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(
      copts)
    .build();
  return driver;

};


