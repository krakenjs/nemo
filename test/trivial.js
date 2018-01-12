
describe('@trivial@', function () {
  it('should run quickly', async function () {
    let nemo = this.nemo;
    let {baseUrl} = nemo.data;
    await nemo.driver.get(baseUrl);
  });
});
