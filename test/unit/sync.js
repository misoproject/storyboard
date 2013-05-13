/* global Miso,module,test,ok,equals */
module("Synchronous Tests");

test("Changing synchronous states", function() {
  var app = new Miso.Storyboard({
    initial : "unloaded",
    scenes : {
      unloaded : {},
      loaded : {}
    }
  });

  app.start().then(function() {
    equals(app.scene(), "unloaded", "initial state is unloaded");
    var done = app.to("loaded");
    ok(app.is("loaded"), "changed state is loaded");
    equals(done.state(), "resolved");
  });

});

test("Changing between multiple synchronous states", function() {
  var app = new Miso.Storyboard({
    initial : "unloaded",
    scenes : {
      unloaded : {},
      loaded : {},
      drilldown : {}
    }
  });

  app.start().then(function() {
    ok(app.is("unloaded"), "initial state is unloaded");
    app.to("loaded");
    ok(app.is("loaded"), "state is loaded");
    app.to("drilldown");
    ok(app.is("drilldown"), "state is drill");
    app.to("loaded");
    ok(app.is("loaded"), "state is loaded");
  });
 });

test("returning false on enter stops transition", 2, function() {
  var app = new Miso.Storyboard({
    initial : "unloaded",
    scenes : {
      unloaded : {},
      loaded : {
        enter : function() {
          return false;
        }
      }
    }
  });

  app.start().then(function() {
    var promise = app.to("loaded");
    promise.fail(function() {
      ok(true);
    });
    equals(app.scene(), "unloaded");
  });
});

test("returning undefined on enter or exit does not cause a failure", 2, function() {
  var app = new Miso.Storyboard({
    initial : "unloaded",
    scenes : {
      unloaded : {
        exit : function() {}
      },
      loaded : {
        enter : function() {}
      }
    }
  });

  app.start().then(function() {
    var promise = app.to("loaded");
    promise.done(function() {
      ok(true);
    });
    equals(app.scene(), "loaded");
  });
});

test("returning false on exit stops transition", 2, function() {
  var app = new Miso.Storyboard({
    initial : "unloaded",
    scenes : {
      loaded : {},
      unloaded : {
        exit : function() {
          return false;
        }
      }
    }
  });

  app.start().then(function() {
    var promise = app.to("loaded");
    promise.fail(function() {
      ok(true);
    });
    equals(app.scene(), "unloaded");
  });
});
