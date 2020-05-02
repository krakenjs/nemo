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
},{
 type: 'suite',
 listener: (context, event) => {
   console.log('suite event fired', event.tags.uid);
 }
},{
  type: 'suite:before',
    listener: (context, event) => {
    console.log('before suite event fired', event.tags.uid);
  }
},{
  type: 'test:before',
    listener: (context, event) => {
    console.log('before test fired', event.test.title);
  }
},{
  type: 'root:before',
  listener: (context, event) => {
    console.log('before root event fired', event.tags.uid);
  }
}];
