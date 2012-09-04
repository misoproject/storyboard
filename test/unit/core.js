(function() {
  module("Scene Basics");

  //TODO
  test("Deferring starting engine", function() {});

  test("Changing synchronous states", function() {
       var app = new Miso.Engine({
      initial : 'unloaded',
      transitions : [
        { name : 'load', from : ['unloaded', 'drill'], to : 'loaded' }
      ]
    });
    equals(app.state(), 'unloaded', 'initial state is unloaded');
    ok(app.is('unloaded'), 'initial state is unloaded');
    var done = app.transition('load');
    ok(app.is('loaded'), 'changed state is loaded');
    equals(done.state(), 'resolved');
  });

  test("Changing between multiple synchronous states", function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      transitions : [
        { name : 'load', from : ['unloaded', 'drill'], to : 'loaded' },
        { name : 'drilldown', from : ['loaded'], to : 'drill' }
      ]
    });

    ok(app.is('unloaded'), 'initial state is unloaded');
    var done = app.transition('drilldown');
    equal(done.state(), 'rejected', 'reject transition to drilldown');
    ok(app.is('unloaded'), 'initial state is unloaded as cannot go to drilldown');
    app.transition('load');
    ok(app.is('loaded'), 'state is loaded');
    equals(app.transition('load').state(),'rejected','cannot transition to a state you are already in');
    app.transition('drilldown');
    ok(app.is('drill'), 'state is drill');
    app.transition('load');
    ok(app.is('loaded'), 'state is loaded');
  });

  test("multiple transitions between two states don't cross-fire", function() {
      var fwd1 = 0, fwd2 = 0;
      var app = new Miso.Engine({
      initial : 'zero',
      transitions : [
        { name : 'fwd1', from : 'zero', to : 'two',
          intro : function() { fwd1 += 1; } },

        { name : 'fwd2', from : 'zero', to : 'two',
          intro : function() { fwd2 += 1; } },

        { name : 'back', from : 'two', to : 'zero' }
      ]
    });
    app.transition('fwd1');
    equals(fwd1, 1);
    equals(fwd2, 0);
    app.transition('fwd2');
    equals(fwd1, 1);
    equals(fwd2, 0);
    app.transition('back');
    app.transition('fwd2');
    equals(fwd1, 1);
    equals(fwd2, 1);
  });


  module("Before and After handlers");
  test("returning false on before stops transition", 2, function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      transitions : [
        { name : 'load', 
          from : 'unloaded', 
          to : 'loaded',
          before : function() {
            console.log('bef!');
            return false;
          }
        }
      ],
    });

    var promise = app.transition('load');

    promise.fail(function() {
      ok(true);
    });
    equals(app.state(), 'unloaded');
  });

  test("returning false on after stops transition", 3, function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      transitions : [
        { name  : 'load', 
          from  : 'unloaded', 
          to    : 'loaded',
          after : function() {
            return false;
          }
        },
        { name : 'drill',
          from : 'loaded',
          to   : 'drilldown'
        }
      ],
    });

    app.transition('load');
    equals(app.state(), 'loaded');
    var promise = app.transition('drill'); 
    promise.fail(function() {
      ok(true);
    });
    equals(app.state(), 'loaded');
  });

  test("async fail on after stops transition", 5, function() {
    var pass;
    var app = new Miso.Engine({
      initial : 'unloaded',
      transitions : [
        { name  : 'load', 
          from  : 'unloaded', 
          to    : 'loaded',
          after : function() {
            pass = this.async();
          }
        },
        { name : 'drill',
          from : 'loaded',
          to   : 'drilldown'
        }
      ],
    });

    app.transition('load');
    equals(app.state(), 'loaded');
    var promise = app.transition('drill'); 
    ok(app.inTransition());
    pass(false);
    promise.fail(function() {
      ok(true);
    });
    ok(!app.inTransition());
    equals(app.state(), 'loaded');
  });

   test("async pass on after completes transition", 6, function() {
    var pass;
    var app = new Miso.Engine({
      initial : 'unloaded',
      transitions : [
        { name  : 'load', 
          from  : 'unloaded', 
          to    : 'loaded',
          after : function() {
            pass = this.async();
          }
        },
        { name : 'drill',
          from : 'loaded',
          to   : 'drilldown'
        }
      ],
    });

    app.transition('load');
    equals(app.state(), 'loaded');
    var promise = app.transition('drill'); 
    ok(app.inTransition());
    equals(app.state(), 'loaded');
    pass(true);
    promise.done(function() {
      ok(true);
    });
    ok(!app.inTransition());
    equals(app.state(), 'drilldown');
  });

  module("Intro and Outro handlers");
  test("Asynchronous intro", function() {
      var done;
      var app = new Miso.Engine({
      initial : 'unloaded',
      transitions : [
        { name : 'load', 
          from : 'unloaded', 
          to : 'loaded',
          intro : function() {
            done = this.async();
          }
        }
      ]
    });
    app.transition('load');
    ok(app.state('unloaded'), "should still be unloaded during transition");
    ok(app.inTransition(), "should be in transition");
    ok(app.transition('load').state(),'rejected', "can't start a second transition");
    done();
    ok(app.state('loaded'));
  });

  //TODO ARGUMENT PASSING TESTS
  
  test("handlers have access to the correct scene", function() {
      var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        loaded : {
          a : 'loaded scene'
        },
        drilldown : {
          a : 'drilldown scene'
        }
      },
      transitions : [
        { name  : 'load', 
          from  : 'unloaded', 
          to    : 'loaded',
          before: function() {
            equals(this.toScene.a, 'loaded scene', 'toScene is loaded in before');
            return true;
          },
          after : function() {
            equals(this.fromScene.a, 'loaded scene', 'fromScene is loaded in after');
            return true;
          },
          intro : function() {
            equals(this.toScene.a,'loaded scene', 'toScene is loaded in intro');
          },
          outro : function() {
            console.log('ff', this);
            equals(this.fromScene.a,'loaded scene', 'fromScene is loaded in outro');
          }
        },
        { name : 'drill',
          from : 'loaded',
          to   : 'drilldown',
           before: function() {
            equals(this.toScene.a, 'drilldown scene', 'toScene is drilldown in before');
            equals(this.fromScene.a, 'loaded scene', 'fromScene is loaded in before');
            return true;
          },
          intro : function() {
            equals(this.fromScene.a, 'loaded scene', 'fromScene is loaded in intro');
            equals(this.toScene.a,'drilldown scene', 'toScene is drilldown in intro');
          }
        }
      ]
    });

    var x = app.transition('load').then(function() {
      app.transition('drill');
    });
  });

}());
