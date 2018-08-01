const net = require('net');

describe('@exit@', function () {
  before(function () {
    const server = net.createServer();
    server.listen(8000, function () {
      console.log('listening on port: 8000');
    });
  });
  it('should not hang when cli option --exit is used ', async function () {
    const {nemo} =  this;
    await nemo.driver.get(nemo.data.baseUrl);
  });
});