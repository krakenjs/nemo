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
