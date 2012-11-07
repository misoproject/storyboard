

module("Storyboard Event Integration");

test("Basic transition events", 1, function() {
  
  var triggersResult = [
    "unloaded:enter",
    "event:unloaded:start",
    "unloaded:exit",
    "event:unloaded:done",
    "loaded:enter",
    "event:loaded:start",
    "loaded:exit",
    "event:loaded:done"
  ], actual = [];
  
  var app = new Miso.Storyboard({
    initial : 'unloaded',
    scenes : {
      unloaded : {
        enter : function() {
          actual.push("unloaded:enter");
        }, 
        exit : function() {
          actual.push("unloaded:exit");
        }
      },
      loaded : {
        enter : function() {
          actual.push("loaded:enter");
        }, 
        exit : function() {
          actual.push("loaded:exit");
        }
      },
      ending : {}

    }
  });

  // verify event triggering order
  app.subscribe('unloaded:start', function() {
    actual.push("event:unloaded:start");
  });

  app.subscribe('unloaded:done', function() {
    actual.push("event:unloaded:done");
  });

  app.subscribe('loaded:start', function() {
    actual.push("event:loaded:start");
  });

  app.subscribe('loaded:done', function() {
    actual.push("event:loaded:done");
  });
  
  app.start().then(function() {
    app.to('loaded').then(function() {
      app.to('ending').then(function() {
        ok(_.isEqual(triggersResult, actual), actual);
      });
    });
  });

});
