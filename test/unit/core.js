(function() {
  module("Scene Basics");

  //TODO
  test("Deferring starting engine", function() {});

  test("Changing synchronous states", function() {
    app = new Miso.Engine({
      initial : 'unloaded',
      transitions : [
        { name : 'load', from : 'unloaded', to : 'loaded' }
      ]
    });

    equals(app.state(), 'unloaded', 'initial state is unloaded');
    ok(app.is('unloaded'), 'initial state is unloaded');
    var done = app.transition('load');
    ok(app.is('loaded'), 'changed state is loaded');
    equals(done.state(), 'resolved');
  });

  // test("Changing between multiple synchronous states", function() {
    // var app = new Miso.Engine({
      // initial : 'unloaded',
      // transitions : [
        // { name : 'load', from : ['unloaded', 'drill'], to : 'loaded' },
        // { name : 'drilldown', from : ['loaded'], to : 'drill' }
      // ],
    // });

    // ok(app.is('unloaded'), 'initial state is unloaded');
    // var done = app.transition('drilldown');
    // equal(done.state(), 'rejected', 'reject transition to drilldown');
    // ok(app.is('unloaded'), 'initial state is unloaded as cannot go to drilldown');
    // app.transition('load');
    // ok(app.is('loaded'), 'state is loaded');
    // app.transition('drilldown');
    // ok(app.is('drill'), 'state is drill');
    // app.transition('load');
    // ok(app.is('loaded'), 'state is loaded');
  // });


  // module("Before and After handlers");
  // test("returning false on before stops transition", 2, function() {
    // var app = new Miso.Engine({
      // initial : 'unloaded',
      // transitions : [
        // { name : 'load', 
          // from : 'unloaded', 
          // to : 'loaded',
          // before : function() {
            // return false;
          // }
        // }
      // ],
    // });

    // var promise = app.transition('load');

    // promise.fail(function() {
      // ok(true);
    // });
    // equals(app.getState(), 'unloaded');
  // });

  // test("returning false on after stops transition", 3, function() {
    // var app = new Miso.Engine({
      // initial : 'unloaded',
      // transitions : [
        // { name  : 'load', 
          // from  : 'unloaded', 
          // to    : 'loaded',
          // after : function() {
            // return false;
          // }
        // },
        // { name : 'drill',
          // from : 'loaded',
          // to   : 'drilldown'
        // }
      // ],
    // });

    // app.transition('load');
    // equals(app.getState(), 'loaded');
    // var promise = app.transition('drill'); 
    // promise.fail(function() {
      // ok(true);
    // });
    // equals(app.getState(), 'loaded');
  // });

  // test("Scope for before callback is the engine", 1, function() {
  // var app = new Miso.Engine({
      // initial : 'unloaded',
      // transitions : [
        // { name : 'load', 
          // from : 'unloaded', 
          // to : 'loaded',
          // before : function() {
            // ok(( this instanceof Miso.Engine) );
          // }
        // }
      // ],
    // });
    // app.transition('load');
  // });

  // test("Scope for after callback is the engine", 1, function() {
     // var app = new Miso.Engine({
      // initial : 'unloaded',
      // transitions : [
        // { name : 'load', 
          // from : 'unloaded', 
          // to : 'loaded',
          // after : function() {
            // ok(( this instanceof Miso.Engine) );
          // }
        // },
         // { name : 'drill', 
          // from : 'loaded', 
          // to : 'drilldown'
        // }
      // ],
    // });
    // app.transition('load');
    // app.transition('drill');
  // });

  // module("Intro and Outro handlers");
  // test("Asynchronous intro", function() {
      // var done;
      // var app = new Miso.Engine({
      // initial : 'unloaded',
      // transitions : [
        // { name : 'load', 
          // from : 'unloaded', 
          // to : 'loaded',
          // intro : function() {
            // done = this.async();
          // }
        // }
      // ],
    // });
    // app.transition('load');
    // console.log('dd', done, done.state() );
    // //should have the old state during transition
    // // ok(app.isState('unloaded'));
    // //should be in transition
    // //should reject attempts to change state again
    // // done();
    // // ok(app.isState('loaded'));

  // });

}());
