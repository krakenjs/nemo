beforeEach('Nemo Instance for global beforeEach @eachTest@', function () {
  if (this.nemo) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('no nemo'));
});

afterEach('Nemo Instance for global afterEach @eachTest@', function () {
  if (this.nemo) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('no nemo'));
});

describe('Nemo Instance for @eachTest@', function () {
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
  it('should pass', function () {
    let nemo = this.nemo;
    //verify nemo.mocha property
    if (!nemo.mocha === this) {
      return Promise.reject(new Error('didnt find mocha context at nemo.mocha'));
    }
    return nemo.driver.get(nemo.data.baseUrl);
  });
  describe('Nemo Nested Instance for @eachTest@', function () {
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
    it('should pass', function () {
      let nemo = this.nemo;
      //verify nemo.mocha property
      if (!nemo.mocha === this) {
        return Promise.reject(new Error('didnt find mocha context at nemo.mocha'));
      }
      return nemo.driver.get(nemo.data.baseUrl);
    });
  });
});
