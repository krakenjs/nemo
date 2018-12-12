
describe('@suite1@suite2@suite3@suite4@', function () {
  before(async function () {
    if (this.nemo) {
      await Promise.resolve();
      return;
    }
    await Promise.reject(new Error('no nemo'));
  });
  after(async function () {
    if (this.nemo) {
      await Promise.resolve();
      return;
    }
    await Promise.reject(new Error('no nemo'));
  });
  beforeEach(async function () {
    if (this.nemo) {
      await Promise.resolve();
      return;
    }
    await Promise.reject(new Error('no nemo'));
  });
  afterEach(async function () {
    if (this.nemo) {
      await Promise.resolve();
      return;
    }
    await Promise.reject(new Error('no nemo'));
  });
  it('may fail a few times1', async function () {
    let nemo = this.nemo;
    //verify nemo.mocha property
    if (!nemo.mocha === this) {
      await Promise.reject(new Error('didnt find mocha context at nemo.mocha'));
      return;
    }
    await nemo.driver.get(nemo.data.baseUrl);
    await nemo.snap();
    await nemo.snap();
  });
  describe('@inner@', function () {
    before(async function () {
      if (this.nemo) {
        await Promise.resolve();
        return;
      }
      await Promise.reject(new Error('no nemo'));
    });
    after(async function () {
      if (this.nemo) {
        await Promise.resolve();
        return;
      }
      await Promise.reject(new Error('no nemo'));
    });
    beforeEach(function () {
      if (this.nemo) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('no nemo'));
    });
    afterEach(function () {
      if (this.nemo) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('no nemo'));
    });
    it('may fail a few times2', async function () {
      let nemo = this.nemo;
      //verify nemo.mocha property
      if (!nemo.mocha === this) {
        return Promise.reject(new Error('didnt find mocha context at nemo.mocha'));
      }
      await nemo.driver.get(nemo.data.baseUrl);
      await nemo.view.google.text().sendKeys('foo');
      await nemo.snap();
      await nemo.driver.sleep(500);
    });
    it('merges top level data', async function () {
      let nemo = this.nemo;
      //verify nemo.mocha property
      if (!nemo.data.foo) {
        await Promise.reject(new Error('didnt find nemo.data.foo'));
        return;
      }
      await Promise.resolve();

    });
  });

});
