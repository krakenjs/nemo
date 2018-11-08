/** *******************   Added Localized Test Data Begin   ************************/
const path = require('path');
const nextgenDataproviderUil = require('../util/dataProviderUtil');
const multipleTestsCapabilities = require('../util/multipleTestsCapabilities');
const isFile = require('../util/fileHandler.js').isFile;
const isDirectory = require('../util/fileHandler.js').isDirectory;
const baseUrl = "";
const productUrl = "";

function getNextGenTestCases(defaultBase = {}, nextGenConfig = {}, baseDirectory) {

  let nextGenBase = {}
  Object.assign(nextGenBase, defaultBase);
  nextGenConfig.hasOwnProperty("baseUrl") || console.log("base URL not set Using default: " + baseUrl);
  nextGenConfig.baseUrl = baseUrl
  nextGenConfig.productUrl = productUrl

  let nextGenInjectionTestCases = {};
  let allBases = {};
  let locales = [];
  let dataProviderFile = '';
  let testPath = '';
  let isFiltered = false;
  let singleLocaleMode = false;
  nextGenBase.data = {};


  if (process.argv.slice(2).indexOf('-B') >= 0) {
    testPath = process.argv.slice(2)[process.argv.slice(2).indexOf('-B') + 1];
  }

  if (process.argv.slice(2).indexOf('-K') >= 0) {
    process.env.SOURCE = process.env.source = process.argv.slice(2)[process.argv.slice(2).indexOf('-K') + 1] == 1;
  }
  
  nextGenBase.sourceRun = (process.env.SOURCE && process.env.source) || false;
  console.log("SOURCE RUN: ", nextGenBase.sourceRun)

  let nextGenInjectionParameters = process.argv.slice(2)[process.argv.slice(2).indexOf('-I') + 1];

  if (!nextGenInjectionParameters.includes(':') && !nextGenInjectionParameters.includes('+')) {
    let testcaseNames = nextGenInjectionParameters.split(',');
    if (isDirectory(testcaseNames[0])) {
      console.log('Running all tests in directory and subdirectories in: ' + JSON.stringify(testcaseNames));
      nextGenInjectionTestCases = multipleTestsCapabilities.getAllTestsNames(testcaseNames);
    } else if (isFile(testcaseNames[0])) {
      console.log('Runing all tests in File: ' + JSON.stringify(testcaseNames));
      nextGenInjectionTestCases = multipleTestsCapabilities.getTestsFromFile(testcaseNames);
    } else {
      nextGenInjectionTestCases = multipleTestsCapabilities.getTestsByName(testPath + 'spec/flow/', testcaseNames);
    }

  } else {
    let filterNames = nextGenInjectionParameters.split('::')
    let filterCaseIDs = {}

    filterNames.forEach(function (filterName) {
      if (filterName.length > 0) {
        let filterNameContent = filterName.split(':')
        filterCaseIDs[filterNameContent[0]] = filterNameContent[1].length > 0 ? (filterCaseIDs[filterNameContent[0]] instanceof Array ? filterCaseIDs[filterNameContent[0]].concat(filterNameContent[1].split(',')) : filterNameContent[1].split(',')) : [];
      }
    })
    nextGenInjectionTestCases = multipleTestsCapabilities.splitfilters([testPath + 'spec/flow/'], [testPath + 'spec/dataprovider/'], filterCaseIDs)
    isFiltered = true;
  }


  for (let testSuiteName in nextGenInjectionTestCases) {

    let baseData = []
    Object.assign(baseData, isFiltered ? Object.keys(nextGenInjectionTestCases[testSuiteName].testcases) : nextGenInjectionTestCases[testSuiteName].testcases)
    baseData.forEach(function (testCaseName) {
      allBases[testCaseName] = {};
      Object.assign(allBases[testCaseName], nextGenBase);

      let projectPathName = testSuiteName.split('_')[0];
      let dataFileName = nextGenInjectionTestCases[testSuiteName].fileName + '.json';

      // Set dataprovider file
        dataProviderFile = testPath + 'spec/dataprovider/' + projectPathName + '/' + dataFileName;

      if (isFiltered) {
        if (nextGenInjectionTestCases[testSuiteName].testcases[testCaseName].length > 0) {
          allBases[testCaseName].data = nextgenDataproviderUil.getTestsDataByCountry(testCaseName, dataProviderFile, nextGenInjectionTestCases[testSuiteName].testcases[testCaseName], nextGenConfig);
        } else {
          allBases[testCaseName].data = nextgenDataproviderUil.getTestsData(testCaseName, dataProviderFile, nextGenConfig, singleLocaleMode);
        }
      } else {

        if (locales.length > 0) {
          allBases[testCaseName].data = nextgenDataproviderUil.getTestsDataByCountry(testCaseName, dataProviderFile, locales, nextGenConfig);
        } else {
          allBases[testCaseName].data = nextgenDataproviderUil.getTestsData(testCaseName, dataProviderFile, nextGenConfig, singleLocaleMode);
        }
      }

      Object.keys(allBases[testCaseName].data).forEach(function (keys) {
        allBases[testCaseName].data[keys].sourceRun = nextGenBase.sourceRun;
        allBases[testCaseName].tests = allBases[testCaseName].data[keys].tests;
      })


    })

  }

  let nextGenProfiles = {}
  Object.keys(allBases).forEach(function (profileName) {
    nextGenProfiles[profileName] = {}//base
    Object.assign(nextGenProfiles[profileName], allBases[profileName])
    nextGenProfiles[profileName].data = {}//data
    nextGenProfiles[profileName].tests = path.resolve(baseDirectory, allBases[profileName].tests.replace("path:", ""));
    Object.assign(nextGenProfiles[profileName].data, allBases[profileName].data)//locales
  })
  return nextGenProfiles;
}


module.exports = {
  getNextGenTestCases: getNextGenTestCases
}
