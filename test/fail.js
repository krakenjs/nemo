
describe('@fail@', function () {
  it('should fail @once@', async function () {
    let nemo = this.nemo;
    await Promise.reject('boom');
  });
  it('should fail @twice@', async function () {
    let nemo = this.nemo;
    await Promise.reject('boom');
  });
});
