module.exports = function (emitter) {
  emitter.on('test', (context, event) => {
    console.log(`another testlistener ${event.test.title} status: ${event.test.state}`);
  });
};
