const assert = require('assert');

describe('@dynamic@', function () {
  it('should run quickly', async function () {
    let nemo = this.nemo;
    let {baseUrl, urlFromCli} = nemo.data;
    assert.equal(nemo.data.urlFromCli, 'https://www.wikipedia.org', 'urlFromCli should equal to https://www.wikipedia.org');
    await nemo.driver.get(urlFromCli || baseUrl);
  });
});
