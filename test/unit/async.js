module("Asynchronous tests");

test("Asynchronous enter", function() {
  var done;
  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
      unloaded : {},
      loaded : {
        enter : function() {
          done = this.async();
        }
      }
    }
  });
  app.start().then(function() {
    app.to('loaded');
    ok(app.scene('unloaded'), "should still be unloaded during transition");
    ok(app.inTransition(), "should be in transition");
    ok(app.to('loaded').state(),'rejected', "can't start a second transition");
    done();
    ok(app.scene('loaded'));
    ok(!app.inTransition(), "should no longer be in transition");
  });
});

test("Cancelling a transition in progress", 4, function() {
  var done;
  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
      unloaded : {
        exit : function() {
          done = this.async();
        }
      },
      loaded : {}
    }
  });

  app.start().then(function() {
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
});

test("async handlers are executed in the correct order", 1, function() {
  var order = [];
  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
      unloaded : {
        exit: function() {
          var done = this.async();
          setTimeout(function() {
            order.push('a');
            done();
          }, 100);
        }
      },
      loaded : {
        enter : function() {
          order.push('b');
        }
      }
    }
  });

  app.start().then(function() {
    app.to('loaded');
    stop();
    setTimeout(function() {
      start();
      equals(order.join(''), 'ab', 'handlers fired in the corect order');
    }, 200);
  });
});

test("async fail on enter stops transition", 4, function() {
  var pass;
  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
      unloaded : {},
      loaded : {
        enter : function() {
          pass = this.async();
        }
      }
    }
  });

  app.start().then(function() {
    var promise = app.to('loaded'); 
    ok(app.inTransition());
    pass(false);
    promise.fail(function() {
      ok(true);
    });
    ok(!app.inTransition());
    equals(app.scene(), 'unloaded');
  });
});

test("async fail on exit stops transition", 4, function() {
  var pass;
  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
      unloaded : {
        exit : function() {
          pass = this.async();
        }
      },
      loaded : {}
    }
  });

  app.start().then(function() {
    var promise = app.to('loaded'); 
    ok(app.inTransition());
    pass(false);
    promise.fail(function() {
      ok(true);
    });
    ok(!app.inTransition());
    equals(app.scene(), 'unloaded');
  });
});

test("passing a custom deferred to to", 1, function() {
  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
      unloaded : {},
      loaded : {}
    }
  });

  app.start().then(function() {
    var done = _.Deferred();
    done.done(function() {
      ok(true);
    });
    app.to('loaded', [], done);
  });
});
