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
  type: 'beforesuite',
    listener: (context, event) => {
    console.log('before suite event fired', event.tags.uid);
  }
},{
  type: 'beforetest',
    listener: (context, event) => {
    console.log('before test fired', event.test.title);
  }
}];
