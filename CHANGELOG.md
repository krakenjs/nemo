## UNRELEASED

- remove conditional around "zero tests" check in mocha runner

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
