describe('@form@', function () {
  it('should fill in a simple form', async function () {
    let nemo = this.nemo;

    let {name, email, message, sendButton, result} = nemo.view.form;
    await nemo.driver.get(nemo.data.baseUrl);
    await name().sendKeys('Bill Withers');
    await email().sendKeys('bwithers@soul.singer');
    await message().sendKeys(nemo.data.useme);
    await nemo.snap();
    await sendButton().click();
    await result.waitVisible();
    await result.textEquals('405 Not Allowed');
  });
});
