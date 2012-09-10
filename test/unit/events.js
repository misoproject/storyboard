module("Events");

// test("basic transition events", 10, function() {
  // var app = new Miso.Engine({
    // initial : 'unloaded',
    // scenes : {
      // 'unloaded' : {},
      // 'loaded' : {}
    // }
  // });

  // app.subscribe('transition.start', function(transition, from, to) {
    // equals(transition, 'load');
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
  // });

  // app.subscribe('load.start', function(from, to) {
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
  // });

  // app.subscribe('transition.end', function(transition, from, to) {
    // equals(transition, 'load');
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
  // });

  // app.subscribe('load.end', function(from, to) {
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
  // });

  // app.transition('load');
// });

// test("transition fail - transitioning", 22, function() {
  // var app = new Miso.Engine({
    // initial : 'unloaded',
    // transitions : [
      // { name : 'load', from : ['unloaded', 'drill'], to : 'loaded',
        // intro : function() { this.async() }
    // }
    // ]
  // });

  // app.subscribe('transition.start', function(transition, from, to) {
    // equals(transition, 'load');
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
  // });

  // app.subscribe('load.start', function(from, to) {
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
  // });


  // app.subscribe('transition.valid', function(transition, from, to) {
    // equals(transition, 'load');
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
  // });

  // app.subscribe('load.valid', function(from, to) {
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
  // });

  // app.subscribe('transition.fail', function(transition, from, to, msg) {
    // equals(transition, 'load');
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
    // equals(msg, Miso.Engine.errors.inTransition);
  // });

  // app.subscribe('load.fail', function(from, to, msg) {
    // equals(from, 'unloaded');
    // equals(to, 'loaded');
    // equals(msg, Miso.Engine.errors.inTransition);
  // });

  // app.transition('load');
  // app.transition('load');
// });

// test("transition fail - cannot", 3, function() {
  // var app = new Miso.Engine({
    // initial : 'unloaded',
    // transitions : [
      // { name : 'load', from : ['unloaded', 'drill'], to : 'loaded' },
      // { name : 'drilldown', from : ['loaded'], to : 'drill' }
    // ]
  // });

  // app.subscribe('drilldown.fail', function(from, to, msg) {
    // equals(from, 'unloaded');
    // equals(to, 'drill');
    // equals(msg, Miso.Engine.errors.cannot);
  // });

  // app.transition('drilldown');

// });
