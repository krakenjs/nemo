
describe('@pay@', function () {
  it('should show a signup form for payment processor', async function () {
    let nemo = this.nemo;
    let {baseUrl, signupButton, signupForm} = nemo.data;
    await nemo.driver.get(baseUrl);
    await nemo.view._find(signupButton).click();
    await nemo.view._waitVisible(signupForm);
  });
});
