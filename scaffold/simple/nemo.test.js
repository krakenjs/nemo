
describe('@firstTest@', function () {
  it('should load a website', async function () {
    await this.nemo.driver.get(this.nemo.data.baseUrl);
  });
});
