
describe('@suite1@suite2@suite3@suite4@', function () {
  before(function () {
    if (this.nemo) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('no nemo'));
  });
  after(function () {
    if (this.nemo) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('no nemo'));
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
  it('may fail a few times1', function () {
    let nemo = this.nemo;
    //verify nemo.mocha property
    if (!nemo.mocha === this) {
      return Promise.reject(new Error('didnt find mocha context at nemo.mocha'));
    }
    return nemo.driver.get(nemo.data.baseUrl)
      .then(function () {
        return nemo.snap();
      })
      .then(function () {
        return nemo.snap();
      })
  });
  describe('@inner@', function () {
    before(function () {
      if (this.nemo) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('no nemo'));
    });
    after(function () {
      if (this.nemo) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('no nemo'));
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
    it('may fail a few times2', function () {
      let nemo = this.nemo;
      //verify nemo.mocha property
      if (!nemo.mocha === this) {
        return Promise.reject(new Error('didnt find mocha context at nemo.mocha'));
      }
      return nemo.driver.get(nemo.data.baseUrl)
        .then(function () {
          return nemo.driver.sleep(500);
        });
    });
  });

});
