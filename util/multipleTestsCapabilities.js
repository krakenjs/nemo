/* eslint-disable */
'use strict'

const readTestCaseFiles = require('./fileHandler.js').readTestCaseFiles;
const readDataProviderFiles = require('./fileHandler.js').readDataProviderFiles;
const readTestFile = require('./fileHandler.js').readTestFile;
const isFile = require('./fileHandler.js').isFile;
const isDirectory = require('./fileHandler.js').isDirectory;

const getAllTestsNames = (exports.getAllTestsNames = (dirs) => {
  let tests = {};
  dirs.forEach(function (dir) {

    let testData = readTestCaseFiles(dir);
    // for each test file get the suite name and each testcase names
    testData.forEach(function (content) {
      // get the suite name
      let suiteName = content.content.match(/describe(.*?)\)/g);
      if (suiteName.length > 0) {
        suiteName = suiteName[0].replace('describe(\'', '').replace(/'.*/g, '');


        // check for duplicate suite names
        if (tests.hasOwnProperty(suiteName)) {
          if (tests[suiteName].fileName !== content.fileName) {
            throw new Error('\n\n Duplicate Suite Name > ' + suiteName + '\n  Make sure each suite name is unique \n');
          }
        }


        // get testcases names
        let testsNames = content.content.match(/it\('(.*?)',/g);
        testsNames = testsNames.map(function (testName) {
          return testName.replace('it(\'', '').replace(/'.*/g, '');
        });

        tests[suiteName] = tests[suiteName] || {};
        tests[suiteName].fileName = content.fileName;
        tests[suiteName].filepath = content.filepath;
        if (!Array.isArray(tests[suiteName].testcases)) {
          tests[suiteName].testcases = [];
        }

        tests[suiteName].testcases = tests[suiteName].testcases.concat(testsNames);
      }
    });
  });

  return tests;
});

const getTestsFromFile = (exports.getTestsFromFile = (filePaths) => {
  let tests = {};

  filePaths.forEach(function (filePath) {
    let testData = readTestFile(filePath);

    // for each test file get the suite name and each testcase names
    // get the suite name
    let suiteName = testData.content.match(/describe(.*?)\)/g);
    if (suiteName.length > 0) {
      suiteName = suiteName[0].replace('describe(\'', '').replace(/'.*/g, '');
      // get testcases names
      let testsNames = testData.content.match(/it\('(.*?)',/g);
      testsNames = testsNames.map(function (testName) {
        return testName.replace('it(\'', '').replace(/'.*/g, '');
      });
      tests[suiteName] = {};
      tests[suiteName].testcases = testsNames;
      tests[suiteName].fileName = testData.fileName;
      tests[suiteName].filepath = testData.filepath;
    }
  });


  return tests;
});

const getTestsByName = (exports.getTestsByName = (dir, testCaseNames) => {
  let test = {};
  let allTests = {};
  allTests = this.getAllTestsNames(dir.split(','));
  for (let testSuiteName in allTests) {
    testCaseNames.forEach(function (testName) {
      if (allTests[testSuiteName].testcases.includes(testName)) {
        test[testSuiteName] = {};
        test[testSuiteName].testcases = [];
        test[testSuiteName].testcases.push(testName);
        test[testSuiteName].fileName = allTests[testSuiteName].fileName;
      }
    });
  }
  return test;
});


const getFilteredTestsByCaseId = (exports.getFilteredTestsByCaseId = (dirs, filterCaseIds = {}) => {
  let testsfilteredByCaseID = {};
  dirs.forEach(function (dir) {
    let dataproviderContent = readDataProviderFiles(dir);
    // for each test file get the suite name and each testcase names
    dataproviderContent.forEach(function (content) {
      let jsonDataProvider = JSON.parse(content.content);
      let testFilePath = content.fileName.replace('dataprovider', 'flow').replace('.json', '.js');

      // filter by case IDS
      let filteredDataProviders = {};
      if (Object.keys(filterCaseIds).length > 0) {
        for (let dataProviderKey in jsonDataProvider) {
          if (Object.keys(filterCaseIds).includes(jsonDataProvider[dataProviderKey].default.caseID)) {
            if (!filteredDataProviders.hasOwnProperty(dataProviderKey)) {
              filteredDataProviders[dataProviderKey] = jsonDataProvider[dataProviderKey];
              filteredDataProviders[dataProviderKey].filtered_locales = filterCaseIds[jsonDataProvider[dataProviderKey].default.caseID];
            }
          }
        }

        if (Object.keys(filteredDataProviders).length > 0) {
          // get suite name from file
          let dataProviderTests = getTestsFromFile([testFilePath]);
          Object.keys(dataProviderTests).forEach(function (testSuiteName) {
            dataProviderTests[testSuiteName].testcases = {};
            for (let testName in filteredDataProviders) {
              if (filteredDataProviders.hasOwnProperty(testName)) {
                dataProviderTests[testSuiteName].testcases[testName] = filteredDataProviders[testName].filtered_locales

              }
            }
          });

          Object.assign(testsfilteredByCaseID, dataProviderTests);
        }
      }
    });
  });
  return testsfilteredByCaseID;
});
const getFilteredTestsByTestName = (exports.getFilteredTestsByTestName = (dirs, filterTestNames = {}) => {
  let testsfilteredByName = {};
  dirs.forEach(function (dir) {
    // let dataproviderContent = readDataProviderFiles(dir);
    // for each test file get the suite name and each testcase name

    //get all tests  by name
    let filteredTestNames = Object.keys(filterTestNames)
    let testsToFilter = getTestsByName(dir, filteredTestNames)
    for (let testSuiteName in testsToFilter) {
      if (testsToFilter[testSuiteName].testcases.length > 0) {
        testsfilteredByName[testSuiteName] = {}
        testsfilteredByName[testSuiteName].testcases = {};

        testsToFilter[testSuiteName].testcases.forEach(function (testName) {

          if (filteredTestNames.includes(testName)) {
            testsfilteredByName[testSuiteName].testcases[testName] = filterTestNames[testName]

            testsfilteredByName[testSuiteName].fileName = testsToFilter[testSuiteName].fileName
          }

        })
      }


    }

  });
  return testsfilteredByName;
});
const getFilteredTestsByFile = (exports.getFilteredTestsByFile = (filterTestPaths = {}) => {
  let testsfilteredByPath = {};
  // let dataproviderContent = readDataProviderFiles(dir);
  // for each test file get the suite name and each testcase name

  //get all tests from file and paths
  let filteredTestNames = Object.keys(filterTestPaths)
  let testsToFilter = getTestsFromFile(filteredTestNames)

  for (let testSuiteName in testsToFilter) {
    testsfilteredByPath[testSuiteName] = {}
    testsfilteredByPath[testSuiteName].testcases = {};
    let filterFilePath = testsToFilter[testSuiteName].filepath // change file path to directory (remove file name )

    testsToFilter[testSuiteName].testcases.forEach(function (testName) {
      if (filteredTestNames.includes(filterFilePath)) {
        testsfilteredByPath[testSuiteName].testcases[testName] = filterTestPaths[filterFilePath]
        testsfilteredByPath[testSuiteName].fileName = testsToFilter[testSuiteName].fileName
      }

    })

  }

  return testsfilteredByPath;
});
const getFilteredTestsByPath = (exports.getFilteredTestsByPath = (filterTestPaths = {}) => {
  let testsfilteredByPath = {};


  //get all tests from file and paths
  let filteredTestNames = Object.keys(filterTestPaths)
  // get all existing testcases
  for (let filterPath in filterTestPaths) {
    let testsToFilter = {}
    Object.assign(testsToFilter, getAllTestsNames([filterPath.replace()]))

    for (let testSuiteName in testsToFilter) {

      //get the filter directory
      let filterDirectory = testsToFilter[testSuiteName].filepath.replace(testsToFilter[testSuiteName].filepath.replace(/^.*[\\\/]/, ''), '') // change file path to directory (remove file name )


      if (filteredTestNames.includes(filterDirectory)) {
        testsfilteredByPath[testSuiteName] = {}
        testsfilteredByPath[testSuiteName].testcases = {};
        //add allr requested directories with their respective test case names
        testsToFilter[testSuiteName].testcases.forEach(function (testName) {
          testsfilteredByPath[testSuiteName].testcases[testName] = filterTestPaths[filterDirectory]
          testsfilteredByPath[testSuiteName].fileName = testsToFilter[testSuiteName].fileName
        })

      }
    }
  }

  return testsfilteredByPath;
});
const splitfilters = (exports.splitfilters = (testPath, dataProviderPath, filterTestPaths = {}) => {
  let byFile = {}
  let byFolder = {}
  let byName = {}
  let byCaseID = {}
  let allFilteredTests = {};
  let regex = new RegExp(/^[C].*/)
  let filterNames = Object.keys(filterTestPaths)

  if (filterNames.length > 0) {
    filterNames.forEach(function (filterName) {
      let filterLocales = filterTestPaths[filterName]
      if (isDirectory(filterName)) {

        byFolder[filterName] = filterLocales

      } else if (isFile(filterName)) {

        byFile[filterName] = filterLocales
      } else {
        //its either testcase name or case id name
        if (regex.test(filterName)) {
          //its Case ID
          byCaseID[filterName] = filterLocales
        } else {
          //most likely testcase name
          byName[filterName] = filterLocales
        }

      }
    })


    if (Object.keys(byFile).length > 0) {
      mergeJSONObject(allFilteredTests, getFilteredTestsByFile(byFile))
    }
    if (Object.keys(byFolder).length > 0) {
      mergeJSONObject(allFilteredTests, getFilteredTestsByPath(byFolder))
    }
    if (Object.keys(byName).length > 0) {
      mergeJSONObject(allFilteredTests, getFilteredTestsByTestName(testPath, byName))
    }
    if (Object.keys(byCaseID).length > 0) {
      mergeJSONObject(allFilteredTests, getFilteredTestsByCaseId(dataProviderPath, byCaseID))
    }


  }
  return allFilteredTests;
})


function mergeJSONObject(target, source) {
  for (let sourceSuiteName in source) {
    if (!target.hasOwnProperty(sourceSuiteName)) {
      target[sourceSuiteName] = source[sourceSuiteName]
    } else {
      //find if same testnames exist
      Object.keys(source[sourceSuiteName].testcases).forEach(function (key) {
        target[sourceSuiteName].testcases[key] = source[sourceSuiteName].testcases[key];
      });

    }
  }
}
