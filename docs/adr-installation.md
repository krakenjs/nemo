# Installing ADR

## ADR Tools | MAC

```bash

    brew install adr-tools

```

## NPM module

```bash

    # getting started
    npm install -D madr && mkdir -p docs/adr && cp node_modules/madr/template/* docs/adr/

    # for generating ADR log
    npm install -g adr-log

```

## Generating adr-log

```bash
    # from repo-root directory
    cd docs/adr && adr-log -i

    # inside repo-root/docs/adr
    adr-log -i
```

## Sample run

```bash

    $ npm install -D madr && mkdir -p docs/adr && cp node_modules/madr/template/* docs/adr/

    > chromedriver@2.43.0 install <repo>/node_modules/chromedriver
    > node install.js

    Downloading https://chromedriver.storage.googleapis.com/2.43/chromedriver_mac64.zip
    Saving to /var/folders/f9/rhj_qvc53h3508sppjn9m5nm3kgk88/T/chromedriver/chromedriver_mac64.zip
    Received 781K...
    Received 1568K...
    Received 2352K...
    Received 3136K...
    Received 3920K...
    Received 4704K...
    Received 5488K...
    Received 5847K total.
    Extracting zip contents
    Copying to target path <repo>/node_modules/chromedriver/lib/chromedriver
    Fixing file permissions
    Done. ChromeDriver binary available at <repo>/node_modules/chromedriver/lib/chromedriver/chromedriver
    + madr@2.1.0
    added 6 packages from 8 contributors, removed 12 packages, updated 19 packages and audited 1037 packages in 8.652s
    found 0 vulnerabilities

```
