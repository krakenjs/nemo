
describe('@search@', function () {
  it('should execute a web search', async function () {
    let nemo = this.nemo;
    let {baseUrl, input, button, result} = nemo.data;
    await nemo.driver.get(baseUrl);
    await nemo.view._find(input).sendKeys('nemo selenium');
    await nemo.view._find(input).sendKeys(nemo.wd.Key.TAB); // close any modal overlay (like google has)
    await nemo.view._find(button).click();
    await nemo.view._waitVisible(result);
  });
});
