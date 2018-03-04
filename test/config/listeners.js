module.exports = [{
  type: 'pass',
  listener: (context, event) => {
    console.log(`user event listener: test passed  ${event.test.title}`);
  }
}];
