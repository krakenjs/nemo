/* eslint-disable */
'use strict';


var localizedTestData = require('localizedtestdata');
var existingLocales = localizedTestData.Locales;
var Util = localizedTestData.Util;
let fundDetails = {
  currency: '',
  fundsInCents: 0
};
let creditCardDetails = {
  currency: '',
  primary: false,
  cardNumber: '',
  cardId: '',
  cardType: '',
  cvv: '',
  expirationMonth: '',
  expirationYear: '',
  expired: false,
  issuerRefNumber: '',
  needConfirmed: false,
  startMonth: '',
  startYear: '',
  firstName: '',
  lastName: '',
  walletId: '',
  bin: '',
  lengthOfCardNumber: 0,
  country: ''
};
let bankDetails = {
  currency: '',
  primary: false,
  bankAccountNumber: '',
  bankAccountType: '',
  bankId: '',
  branchLocation: '',
  branchNumber: '',
  checkDigits: '',
  confirmed: false,
  firstName: '',
  lastName: '',
  ibanBankOnly: false,
  ifsc: '',
  routingNumber: '',
  routingNumber2: '',
  routingNumber3: '',
  walletId: '',
  wireCode: '',
  address: '',
  country: ''
};
let jawsUserDefault = {
  currency: '',
  reason: '',
  domain: '',
  password: '',
  timeZone: '',
  firstName: '',
  lastName: '',
  creditcard: [],
  bank: [],
  accountNumber: '',
  apiUserName: '',
  apiPassword: '',
  bizCity: '',
  bizCountry: '',
  bizMonEstablished: 0,
  bizState: '',
  bizUrl: '',
  bizCustomerServEmail: '',
  bizCSPhone: '',
  bizZip: '',
  addressOne: '',
  payPalAccountAddress: '',
  emailPrefix: '',
  seperator: '',
  needExtendedChars: false,
  fund: [],
  acceptUserLegalAgreement: false,
  dateOfBirth: '',
  userExperience: '',
  productConfigNames: [
    ''
  ],
  preferences: [
    {
      value: '',
      type: ''
    }
  ],
  enableIpn: false,
  ipnUrl: '',
  subprimeCategories: [
    ''
  ],
  unconfirmedShippingAddress: false,
  disableCapabilityPrepaid: false,
  holdType: '',
  extendedBizType: '',
  mamAttributes: {
    partnerVisitorID: '',
    partnerAccountNumber: '',
    partnerMerchantExternalID: '',
    nonLoginable: false
  },
  accountType: '',
  bizAddressOne: '',
  bizYearEstablished: 0,
  industry: 0,
  mcc: 0,
  bizType: 0,
  businessName: '',
  businessType: '',
  citizenship: '',
  preferredLanguage: '',
  confirmEmail: true,
  unConfirmedPhone: false,
  emailAddress: '',
  homeAddress1: '',
  homeAddress2: '',
  homeCity: '',
  homeCountry: '',
  homePhoneNumber: '',
  homeState: '',
  homeZip: '',
  mobilePhone: '',
  securityAnswer1: '',
  securityAnswer2: '',
  securityQuestion1: 0,
  securityQuestion2: 0,
  subCategory: 0,
  workPhone: '',
  fraudScore: 0,
  extraParams: '',
  apiSignature: '',
  aveTransSize: 0,
  aveMonthVolume: 0,
  saleVenue: 0,
  onlineRevenuePercentage: 0,
  referEmail: '',
  paymentSolution: '',
  accountCountryCode: '',
  country: ''
};


const readFile = require('./fileHandler.js').readFileSynchronously;


/*
 * The getTestDataByCountry method reads all the tests at a given dataprovider file, filters the tests that needs to be executed by the locale provided in the parameters
 * and returns the final set of tests that need to be executed.
 * @param  {array} locales  requested locales
 * @param {json} testDescription    test description with data and defaul
 *
 *
 *  getTestsData("test_amount_property_file",'bizwalletnodeweb/transferMoney.json',['US','FR'])
 */
const filterLocales = (locales, testDescription) => {
  Object.keys(testDescription.locales).forEach(
    function (locale) {
      let requestedLocales = '';
      locales.forEach(function (filteredLocale) {
        if (locale.includes(filteredLocale)) {
          requestedLocales = requestedLocales + (',' + filteredLocale);
        }
      });

      requestedLocales = requestedLocales.substring(1);
      if (requestedLocales.length > 0) {
        if (!testDescription.locales.hasOwnProperty(requestedLocales)) {
          testDescription.locales[requestedLocales] = testDescription.locales[locale];
        }
      }
      if (requestedLocales !== locale) {
        delete testDescription.locales[locale];
      }
    }
  );
};


function setBank(bData, country, locale) {
  let data = new Object();
  Object.assign(data, bData);
  let bank = {};

  if (data.bank.length <= 0) {
    data.bank.push({});
  }


  bank = Util.getBank(country);
  data.bank = data.bank.reduce(function (bankDatas, bankData) {
    if (bankData.hasOwnProperty('country')) {
      bank = {}
      bank = Util.getBank(bankData.country);
    }
    if (bank) {
      let newBank = new Object();
      Object.assign(newBank, bankDetails);
      newBank.country = bank.country;
      newBank.currency = bankData.currency || localizedTestData.Locales[locale].currency;
      newBank.ibanBankOnly = bankData.ibanBankOnly || bank.ibanBankOnly || false;
      newBank.bankAccountType = bankData.bankAccountType || bank.bankAccountType;
      newBank.confirmed = bankData.confirmed || bank.confirmed;
      newBank.primary = bankData.primary || bank.primary || false;
      newBank.firstName = bankData.firstName || '';
      newBank.lastName = bankData.lastName || '';
      newBank.walletId = bankData.walletId || '';
      newBank.bankAccountNumber = bankData.bankAccountNumber || '';
      newBank.bankId = bankData.bankId || '';
      if (bankData.bankName) newBank.bankName = bankData.bankName;
      newBank.branchLocation = bankData.branchLocation || '';
      newBank.branchNumber = bankData.branchNumber || '';
      newBank.checkDigits = bankData.checkDigits || '';
      newBank.ifsc = bankData.ifsc || '';
      newBank.routingNumber = bankData.routingNumber || '';
      newBank.routingNumber2 = bankData.routingNumber2 || '';
      newBank.routingNumber3 = bankData.routingNumber3 || '';
      newBank.wireCode = bankData.wireCode || '';
      newBank.address = bankData.address || '';
      bankDatas.push(newBank);
    } else {
      console.log('\n', 'There was a problem fetching localized bank data for', country);
    }

    return bankDatas;
  }, []);
  return data.bank;
}


function setFund(fData, country, locale) {
  let data = new Object();
  Object.assign(data, fData);
  let fund = {};

  if (data.fund.length <= 0) {
    data.fund.push({});
  }


  fund = Util.getFund(country);
  data.fund = data.fund.reduce(function (fundDatas, fundData) {
    if (!fundData.hasOwnProperty('currency')) {
      if (fund) {
        let newFund = new Object();
        Object.assign(newFund, fundDetails);
        newFund.currency = fundDatas.currency || localizedTestData.Locales[locale].primaryBalanceCurrency;
        newFund.fundsInCents = fundDatas.fundsInCents || fund.fundsInCents;
        fundDatas.push(newFund);
      } else {
        console.log('\n', 'There was a problem fetching localized bank data for', country);
      }
    } else {
      fundDatas.push(fundData);
    }

    return fundDatas;
  }, []);
  return data.fund;
}

function setCreditCard(ccData, country, locale) {
  let data = new Object();
  Object.assign(data, ccData);
  let creditcard = {};
  if (data.creditcard.length <= 0) {
    data.creditcard.push({});
  }
  creditcard = Util.getCreditCard(country);
  data.creditcard = data.creditcard.reduce(function (cardDatas, cardData) {
    if (cardData.hasOwnProperty('country')) {
      creditcard = Util.getCreditCard(cardData.country);
    }
    if (creditcard) {
      let newCard = new Object();
      Object.assign(newCard, creditCardDetails);
      newCard.country = creditcard.country;
      newCard.currency = cardData.currency || localizedTestData.Locales[locale].currency;
      newCard.cardType = cardData.cardType || creditcard.cardType;
      newCard.needConfirmed = cardData.needConfirmed || creditcard.needConfirmed;
      newCard.primary = cardData.primary || creditcard.primary || false;
      newCard.expired = cardData.expired || creditcard.expired || false;
      newCard.cardNumber = cardData.cardNumber || '';
      newCard.cardId = cardData.cardId || '';
      newCard.cvv = cardData.cvv || '';
      newCard.expirationMonth = cardData.expirationMonth || '';
      newCard.expirationYear = cardData.expirationYear || '';
      newCard.issuerRefNumber = cardData.issuerRefNumber || '';
      newCard.startMonth = cardData.startMonth || '';
      newCard.startYear = cardData.startYear || '';
      newCard.firstName = cardData.firstName || '';
      newCard.lastName = cardData.lastName || '';
      newCard.walletId = cardData.walletId || '';
      newCard.bin = cardData.bin || '';
      newCard.lengthOfCardNumber = cardData.lengthOfCardNumber || '';
      cardDatas.push(newCard);
    } else {
      console.log('\n', 'There was a problem fetching localized creditcard data for', country);
    }

    return cardDatas;
  }, []);

  return data.creditcard;
}

function traverse(updates, data, callback) {
  for (let i in updates) {
    if (updates[i] !== null && typeof(updates[i]) === "object") {

      traverse(updates[i], data[i], callback);
    } else {
      data[i] = updates[i];
      callback.apply(this, [i, updates[i]]);
    }
  }
}

const setupUser = (user, localeData, locale) => {
  let localeUserData = new Object();
  Object.assign(localeUserData, localeData);

  let country = localeUserData.hasOwnProperty('locale') ?
    (existingLocales.hasOwnProperty(localeUserData.locale) ? existingLocales[localeUserData.locale].country : console.log('\n\n Locale ' + locale + ' was not found \n\n')) :
    (existingLocales.hasOwnProperty(locale) ? existingLocales[locale].country : console.log('\n\n Locale ' + locale + ' was not found \n\n'));

  let defaultUser = {};
  Object.assign(defaultUser, user);
  defaultUser.country = country;
  let fund = Util.getFund(country);
  defaultUser.currency = localeUserData.currency || localizedTestData.Locales[localeUserData.locale || locale].primaryBalanceCurrency;

  // setting up the banks
  if (localeUserData.hasOwnProperty('bank')) {
    defaultUser.bank = setBank(localeUserData, country, localeUserData.locale || locale);
  } else {
    defaultUser.bank = [];
  }


  // setting up the fund
  if (localeUserData.hasOwnProperty('fund')) {
    defaultUser.fund = setFund(localeUserData, country, localeUserData.locale || locale);
  } else {
    defaultUser.fund = [];
  }


  // setting up the creditcards
  if (localeUserData.hasOwnProperty('creditcard')) {
    defaultUser.creditcard = setCreditCard(localeUserData, country, localeUserData.locale || locale);
  } else {
    defaultUser.creditcard = [];
  }


  defaultUser.locale = localeUserData.locale || locale;

  traverse(localeUserData, defaultUser, function (k, v) {

  })

  defaultUser.preferredLanguage = process.env.SOURCE || process.env.source ? "en_" + defaultUser.locale.split('_')[1] : localeUserData.preferredLanguage || localizedTestData.Locales[defaultUser.locale].language;
  defaultUser.firstName = localeUserData.firstName || Util.getFirstName(country);
  defaultUser.lastName = localeUserData.lastName || Util.getLastName(country);
  if (defaultUser.accountType.toLowerCase() === Util.BUSINESS.toLowerCase()) {
    defaultUser.businessType = localeUserData.businessType || Util.getBusinessType(country);
    defaultUser.businessName = localeUserData.businessName || Util.getFirmName(country);
    defaultUser.bizUrl = localeUserData.bizUrl || Util.getBusinessUrl(country);

    defaultUser.bizAddressOne = localeUserData.bizAddressOne || Util.getBusinessAddress(country, 'street1');
    defaultUser.bizCity = localeUserData.bizCity || Util.getBusinessAddress(country, 'city');
    defaultUser.bizState = localeUserData.bizState || Util.getBusinessAddress(country, 'state');
    defaultUser.bizZip = localeUserData.bizZip || Util.getBusinessAddress(country, 'zip');
  }

  defaultUser.homeAddress1 = localeUserData.homeAddress1 || Util.getPersonalAddress(country, 'street1');
  defaultUser.homeAddress2 = localeUserData.homeAddress2 || Util.getPersonalAddress(country, 'street2');
  defaultUser.homeCity = localeUserData.homeCity || Util.getPersonalAddress(country, 'city');
  defaultUser.homeState = localeUserData.homeState || Util.getPersonalAddress(country, 'state');
  defaultUser.homeZip = localeUserData.homeZip || Util.getPersonalAddress(country, 'zip');

  return defaultUser;
};


/**
 * The test data provider utility
 */

const getLocalizedTestData = (testData, urls) => {
  let allLocales = testData.locales || {};
  let testsArray = {};
  if (Object.keys(allLocales).length <= 0) {
    allLocales.en_US = {};
  }
  for (let multilocales in allLocales) {
    // noinspection Annotator
    let tests = JSON.parse(JSON.stringify(testData.default));
    let localeData = allLocales[multilocales];


    // get keys
    let localeKeys = [];
    for (let localeKey in localeData) {
      if (!['bank', 'creditcard'].includes(localeKey)) {
        localeKeys.push(localeKey);
      }
    }

    if (localeKeys.length === 0) {
      localeKeys[0] = 'sender';
      localeData[localeKeys[0]] = {};
      localeKeys[1] = 'receiver';
      localeData[localeKeys[1]] = {};
    } else if (localeKeys.length === 1) {
      localeKeys[1] = 'receiver';
      localeData[localeKeys[1]] = {};
    }


    // if (!localeData.hasOwnProperty('sender')) {
    //     localeData.sender = {};
    // }
    // if (!localeData.hasOwnProperty('receiver')) {
    //     localeData.receiver = {};
    // }

    tests.locale = localeData.locale || tests.locale;
    tests.baseUrl = tests.baseUrl || urls.baseUrl;
    tests.productUrl = tests.productUrl || urls.productUrl;
    tests.tests = testData.tests;

    // setup default sender and receiver
    jawsUserDefault.currency = 'USD';
    jawsUserDefault.accountType = 'PERSONAL';
    jawsUserDefault.preferredLanguage = 'en_US';

    localeKeys.forEach(function (key) {
      if (!tests.hasOwnProperty(key))
        tests[key] = {};

      let tempUserDefault = {}
      Object.assign(tempUserDefault, jawsUserDefault)
      traverse(tests[key], tempUserDefault, function (k, v) {
      })
      Object.assign(tests[key], tempUserDefault);
    });


    let locales = [];
    locales = multilocales.split(',');
    let tempTests = {};
    locales.forEach(function (locale) {
      Object.assign(tempTests, tests);
      localeKeys.forEach(function (key) {
        tempTests[key] = setupUser(tests[key], localeData[key], locale);
      });

      if (localeData.hasOwnProperty('creditcard')) {
        tempTests.creditcard = setCreditCard(localeData, tempTests[localeKeys[0]].country, locale) || localeData.creditcard;
      }

      if (localeData.hasOwnProperty('bank')) {
        tempTests.bank = setBank(localeData, tempTests[localeKeys[0]].country, locale) || localeData.bank;
      }

      testsArray[localeData.locale || locale] = {};
      Object.assign(testsArray[localeData.locale || locale], tempTests);
    });
  }


  return testsArray; // /tests array for  each locale for that description
};


/*
 * The getTestData method reads all the tests at a given dataprovider file, filters the tests that needs to be executed and returns the final set of tests that need to be executed.
 * @param  {string} testCaseName  the testcasename for the data to be provided
 * @param {string}               the test data provider file for that given test
 * @return {json}               the test data for that given test case
 *
 *  getTestsData("test_amount_property_file",'bizwalletnodeweb/transferMoney.json')
 */
const getTestsData = (testCaseName, dataProviderFile, urls, singleLocale) => {
  let testData = {};
  try {
    testData = JSON.parse(
      readFile(dataProviderFile));
  } catch (error) {
    console.log(error);
    console.error('\n Error in file ' + dataProviderFile + '\n');
  }

  let testName = dataProviderFile.replace(/^.*[\\\/]/, '').replace('.json', '');
  let testDescription = testData[testCaseName] || {};
  if (Object.keys(testDescription).length <= 0) {
    console.log('No test case data found with the name: \'' + testCaseName + '\' in file: \'' + dataProviderFile + '\'');
    return;
  }
  if (singleLocale) {
    Object.keys(testDescription.locales).forEach(
      function (locale) {
        let newKeyName = ';';
        if (locale.includes(',')) {
          newKeyName = locale.substring(0, locale.indexOf(','));
        } else {
          newKeyName = locale;
        }

        if (!testDescription.locales.hasOwnProperty(newKeyName)) {
          testDescription.locales[newKeyName] = testDescription.locales[locale];
          delete testDescription.locales[locale];
        }
      }
    );
  }


  testDescription.testName = testName;
  return getLocalizedTestData(testDescription, urls);
};

/*
 * The getTestDataByCountry method reads all the tests at a given dataprovider file, filters the tests that needs to be executed by the locale provided in the parameters
 * and returns the final set of tests that need to be executed.
 * @param  {string} testCaseName  the testcasename for the data to be provided
 * @param {string}               the test data provider file for that given test
 * @return {json}               the test data for that given test case
 *
 *
 *  getTestsData("test_amount_property_file",'bizwalletnodeweb/transferMoney.json',['US','FR'])
 */
const getTestsDataByCountry = (testCaseName, dataProviderFile, locales, urls) => {
  let testData = {};
  try {
    testData = JSON.parse(
      readFile(dataProviderFile));
  } catch (error) {
    console.log(error);
    console.error('\n Error in file ' + dataProviderFile + '\n');
  }

  let testName = dataProviderFile.replace(/^.*[\\\/]/, '').replace('.json', '');
  let testDescription = testData[testCaseName] || {};
  if (Object.keys(testDescription).length <= 0) {
    console.log('No test case data found with the name: \'' + testCaseName + '\' in file: \'' + dataProviderFile + '\'');
    return;
  }
  testDescription.testName = testName;

  // remove locales not requested
  filterLocales(locales, testDescription);

  // add locales requested but are not in data provider
  locales.forEach(function (locale) {
    let addAsNewLocale = true;
    if (!testDescription.locales.hasOwnProperty(locale)) {
      Object.keys(testDescription.locales).every(function (testDescLocale, index) {
        if (testDescLocale.includes(locale)) {
          addAsNewLocale = false;
        }

        return addAsNewLocale;
      });

      if (addAsNewLocale) {
        testDescription.locales[locale] = {};
        testDescription.locales[locale].sender = {};
        testDescription.locales[locale].receiver = {};
      }
    }
  });


  return getLocalizedTestData(testDescription, urls);
};


module.exports = {
  getTestsData: getTestsData,
  getTestsDataByCountry: getTestsDataByCountry
};

// getTestData("../spec/dataprovider/bizwalletnodeweb/transferMoney.json");
