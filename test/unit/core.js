(function() {

  test("extending an engine with additional methods", function() {
    var done = true;
    var app = new Miso.Engine({
      initial : 'unloaded',
      boom : function() {
        done = true;
      },
      scenes : {
        'unloaded' : {
          onEnter : function() {
            this.engine.boom();
          }
        }
      }
    });
    equals(done, true);
  });

  test("Deferring starting engine", function() {
    var done = false;
    var app = new Miso.Engine({
      defer : true,
      initial : 'unloaded',
      scenes : {
        'unloaded' : {
          onEnter : function() {
            done = true;
          }
        },
        'loaded' : {}
      }
    });

    ok(!done, "done is still false");
    app.start();
    ok(done, "done is now true");
    equals(app.start().state(), 'rejected', "Can't start twice");
  });

  test("Changing synchronous states", function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        'unloaded' : {},
        'loaded' : {}
      }
    });
    equals(app.scene(), 'unloaded', 'initial state is unloaded');
    var done = app.to('loaded');
    ok(app.is('loaded'), 'changed state is loaded');
    equals(done.state(), 'resolved');
  });

  test("Changing between multiple synchronous states", function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        'unloaded' : {},
        'loaded' : {},
        'drilldown' : {}
      }
    });

    ok(app.is('unloaded'), 'initial state is unloaded');
    app.to('loaded');
    ok(app.is('loaded'), 'state is loaded');
    app.to('drilldown');
    ok(app.is('drilldown'), 'state is drill');
    app.to('loaded');
    ok(app.is('loaded'), 'state is loaded');
  });

  module("onEnter and onExit handlers");
  test("returning false on onEnter stops transition", 2, function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        'unloaded' : {},
        'loaded' : {
          onEnter : function() {
            return false;
          }
        }
      }
    });

    var promise = app.to('loaded');

    promise.fail(function() {
      ok(true);
    });
    equals(app.scene(), 'unloaded');
  });

  test("returning false on onExit stops transition", 2, function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        loaded : {},
        unloaded : {
          onExit: function() {
            return false;
          }
        }
      }
    });

    var promise = app.to('loaded'); 
    promise.fail(function() {
      ok(true);
    });
    equals(app.scene(), 'unloaded');
  });

   test("returning undefined on onExit does not stop transition", 2, function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        loaded : {},
        unloaded : {
          onExit: function() {}
        }
      }
    });

    var promise = app.to('loaded'); 
    promise.done(function() {
      ok(true);
    });
    equals(app.scene(), 'loaded');
  });


  test("async fail on onExit stops transition", 4, function() {
    var pass;
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        unloaded : {
         onExit : function() {
            pass = this.async();
          }
        },
        loaded : {}
      }
    });

    var promise = app.to('loaded'); 
    ok(app.inTransition());
    pass(false);
    promise.fail(function() {
      ok(true);
    });
    ok(!app.inTransition());
    equals(app.scene(), 'unloaded');
  });

  test("async undefined on onExit does not stop transition", 4, function() {
    var pass;
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        unloaded : {
          onExit : function() {
            pass = this.async();
          }
        },
        loaded : {}
      }
    });

    var promise = app.to('loaded'); 
    ok(app.inTransition());
    pass();
    promise.done(function() {
      ok(true);
    });
    ok(!app.inTransition());
    equals(app.scene(), 'loaded');
  });

   test("async pass on onExit completes transition", 5, function() {
     var pass;
     var app = new Miso.Engine({
       initial : 'unloaded',
       scenes : {
         unloaded : {
           onExit : function() {
             pass = this.async();
           }
         },
         loaded : {}
       }
     });

    var promise = app.to('loaded'); 
    ok(app.inTransition());
    equals(app.scene(), 'unloaded');
    pass(true);
    promise.done(function() {
      ok(true);
    });
    ok(!app.inTransition());
    equals(app.scene(), 'loaded');
  });

  test("Asynchronous onEnter", function() {
      var done;
      var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        unloaded : {},
        loaded : {
          onEnter : function() {
            done = this.async();
          }
        }
      }
    });
    app.to('loaded');
    ok(app.scene('unloaded'), "should still be unloaded during transition");
    ok(app.inTransition(), "should be in transition");
    ok(app.to('loaded').state(),'rejected', "can't start a second transition");
    done();
    ok(app.scene('loaded'));
    ok(!app.inTransition(), "should no longer be in transition");
  });

  test("Cancelling a transition in progress", 4, function() {
    var done;
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        unloaded : {
         onExit : function() {
            done = this.async();
          }
        },
        loaded : {}
      }
    });

    var promise = app.to('loaded');
    ok(app.inTransition(), 'entered transition');
    promise.fail(function() {
      ok(true, "transition promise rejected");
    });
    app.cancelTransition();
    ok(!app.inTransition(), 'no longer in transition');
    promise = app.to('loaded');
    promise.done(function() {
      ok(true, "second attempt succeeds");
    });
    done(true);
  });

  test("passing a custom deferred to to", 1, function() {
     var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        'unloaded' : {},
        'loaded' : {}
      }
    });
    var done = _.Deferred();
    done.done(function() {
      ok(true);
    });
    app.to('loaded', [], done);
  });

  test("handlers have access arguments passed to transition", 4, function() {
    var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        unloaded : {
          onExit : function(a, b) {
            equals(a, 44);
            equals(b.power, 'full');
          }
        },
        loaded : {
          onEnter : function(a, b) {
            equals(a, 44);
            equals(b.power, 'full');
          }
        }
      }
    });

    app.to('loaded', [44, { power : 'full' }]);
  });

  test("handlers have access to the correct scene", 2, function() {
     var app = new Miso.Engine({
      initial : 'unloaded',
      scenes : {
        unloaded : {
          a : 44,
          onExit : function() {
            equals(this.a, 44);
          }
        },
        loaded : {
          a : 'test',
          onEnter : function() {
            equals(this.a, 'test');
          }
        }
      }
    });

    app.to('loaded');
  });

}());
