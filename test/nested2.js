
describe('@suite1.2@suite2.2@suite3.2@suite4.2@', function () {
    it('may fail a few times3', function () {
        let nemo = this.nemo;
        return nemo.driver.get(nemo.data.baseUrl)
            .then(function () {
                return nemo.driver.sleep(500);
            });
    });
    describe('@inner@', function () {
        it('may fail a few times4', function () {
            let nemo = this.nemo;
            return nemo.driver.get(nemo.data.baseUrl)
              .then(function () {
                  return nemo.driver.sleep(500);
              });
        });
    });
});
