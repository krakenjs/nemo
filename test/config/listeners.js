module.exports = [{
  type: 'test',
  listener: (context, event) => {
    console.log(`user event listener: test ${event.test.title} status: ${event.test.state}`);
  }
},{
  type: 'custom:unittest',
  listener: (context, event) => {
    console.log('custom:unittest event fired', event);
  }
}];
