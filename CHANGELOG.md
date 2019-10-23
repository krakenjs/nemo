## 4.11.1

- fix type error that is causing when describe.skip is used (https://github.com/krakenjs/nemo/pull/75)
- skip creating nemo instance when suite has empty tests  (https://github.com/krakenjs/nemo/pull/76)

## 4.11.0

- added suite:before, test:before, suite events (see https://github.com/krakenjs/nemo/pull/71)

## 4.10.0

- greenkeeper dependency updates
- add config to force zero exit code (see https://github.com/krakenjs/nemo/pull/64)

## 4.9.6

- merge/publish greenkeeper update PR https://github.com/krakenjs/nemo/pull/66

## 4.9.5

- fix nemo-core npm audit issues

## 4.9.4

- Feature: More flexible "listeners" property
- fix npm audit issues

## 4.9.3

- fix npm audit issues

## 4.9.2

- Fix: "simple" scaffold not working with nested directory. Promise chaining wasn't waiting for mkdirp
- Fix #57: destroyNemo not properly called in Suite.afterAll in mocha.js

## 4.9.1

- Fix #32: only merge "base" data in data/parallel mode if we aren't running "base" profile
- Fix #52: root data inclusion and override for plain JS config use case
- Fix #53: plugin configuration for plain JS config use case

## 4.9.0

- adding a plain JS/JSON config option (see additional docs in README)

## 4.8.0

- enhance "zero tests" check in mocha runner
  - remove "parallel by file" conditional so it runs for every instance
  - conditionally use "grep" if provided by user
- add "mkdirp" to output listener, to create `summary.json` even if no tests run

## 4.7.0

### Feature

- Add emitter for custom events from test context into master instance as `nemo.runner.emit`

### Fixes

- added post `npm test` verification of report directories/files type/count
- pull CLI-context-based config out into config directory
  - enables future run contexts to have separate base config
- pull `snap` plugin config to config file, to cleanly utilize `confit` and enable overriding if ever required
- fix ES6 eslint issues (var to let/const, etc)
- replaced circular-json npm package with it's successor: flatted.

## 4.6.0

- calculate and set a non-zero exit code if any test failures
- add `-E` or `--exit` CLI option to force exit after Nemo is done running tests

## 4.5.1

- adding a "simple" suite to the scaffold feature

## 4.5.0

- feature: merge nemo.data from base profile with parallel-data data. adding lodash.omit
- feature: pull in nemo-core@1.1 to use custom driver feature
- add logic in runner/mocha.js: if "driver" is a string, prepend with `require:` to load custom driver module

## 4.4.1

- fix driverPerTest: true afterEach context so driver will quit

## 4.4.0

- add `<profile>.driverPerTest`
  - `false` (default): current behavior. single webdriver/nemo instance per Mocha Suite
  - `true`: new behavior. new webdriver/nemo instance per Mocha Test

## 4.3.1

- add nemo to mocha lifecycle context so its available to before/after/beforeEach/afterEach

## 4.3.0

- add `-U` or `--allow-unknown-args` to prevent Nemo from validating CLI arguments

## 4.2.2

- fix scaffold "tests" glob pattern in config

## 4.2.1

- modify scaffold to favor CLI arg -L over env variable in config

## 4.2.0

- fix logic around `output.reports`
  - avoid writing `summary.json` to undefined directory
  - fallback to manually configured mochawesome/xunit if `output.reports` DNE
  - don't create timestamped directories if `output.reports` DNE
  - don't take screenshots if `snap()` has no path specified and `output.reports` DNE
- clean up some error/info logging for consistency
- integrate new [mochawesome-report-generator assetsDir feature](https://github.com/adamgruber/mochawesome-report-generator/blob/master/CHANGELOG.md#added-1)
- rename modules to be more akin to their purpose
- add first revision of graphQL endpoint
- add event emitter and custom events hook
- log errors always (remove `debug()` wrapper)
- couple fixes from [sairamnutheti](https://github.com/sairamnutheti)
  - test errors not reported in mochawesome
  - form test uses deprecated API call
- refactor "instance" to remove mocha concern as a separate file
- remove "instance.reportFile" property and reimplement as a "tag" specified in the reporter custom functions
- truncate "reportFile" tag by removing common report path for better console output

## v4.1.0

- add easier logging via `-L` flag
- remove auto-post-test screenshots
- pull screenshot capability into internal plug-in

## v4.0.3

- upgrade mocha to ^4

## v4.0.1

- major release for ease of use

## v4.0.0-alpha.3

- add datastore capability
- add scaffold capability

## v4.0.0-alpha.1

- rename from nemo-runner to nemo

## v1.5.0-alpha

- works for xunit and mochawesome reporters:
  - group nemo instance reports under directory [MMDDYYYY]/[HHMMSS]
  - add main report.json for set of parallel instances
- add "afterEach" screenshot (for mochawesome, adds image directly to report)
- add "nemo.runner.snap" method to take a screenshot
- fix for #25 (data parallel feature doesn't use specific profile data object)

## v1.4.0

- modify driver kill logic (again) to exit nemo when the `root` mocha Suite ends
- add current mocha test's context to the `nemo.mocha` property

## v1.3.1

- modify driver kill logic to count total suites (fixes nested suites)
- add nested suites to tests
- add couple more scripts to package.json

## v1.3.0

- kill child processes when they error
- add parallel test
- enable the `data` parallel feature

## v1.2.0

- allow setting concurrency limit in config with `maxConcurrent` for parallel testing

## v1.1.1

- prevent mocha from running against 0 matches in "parallel": "file" mode

## v1.1.0

- append profile name to report filename

## v1.0.1

- fix file name appending
- add basic testing

## v1.0.0-alpha.3

- implement parallel by file feature
