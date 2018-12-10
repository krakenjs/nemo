const assert = require('assert');
describe('@override@', function () {
  it('should override nemo.data.foo', async function () {
    let nemo = this.nemo;
    assert.equal(nemo.data.foo, 'fighters');
    await Promise.resolve();
  });
});
