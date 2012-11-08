

module("Storyboard Event Integration");

test("Basic transition events", function() {
  
  var events = [
    'start',
    'x:unloaded:enter',
    'enter',
    'unloaded:enter',
    'end',
    'start',
    'x:unloaded:exit',
    'exit',
    'unloaded:exit',
    'x:loaded:enter',
    'enter',
    'loaded:enter',
    'end',
    'start',
    'x:loaded:exit',
    'exit',
    'loaded:exit',
    'x:ending:enter',
    'enter',
    'ending:enter',
    'end'
  ], actualEvents = [];

  var app = new Miso.Storyboard({
    initial : 'unloaded',
    scenes : {
      unloaded : {
        enter : function() {
          actualEvents.push("x:unloaded:enter");
        }, 
        exit : function() {
          actualEvents.push("x:unloaded:exit");
        }
      },
      loaded : {
        enter : function() {
          actualEvents.push("x:loaded:enter");
        }, 
        exit : function() {
          actualEvents.push("x:loaded:exit");
        }
      },
      ending : {
        enter : function() {
          actualEvents.push("x:ending:enter");
        }
      }
    }
  });

  var eventList = [
    'start','exit','enter','end',
    'unloaded:enter', 'unloaded:exit',
    'loaded:enter', 'loaded:exit',
    'ending:enter', 'ending:exit'
  ];
  _.each(eventList, function(event) {
    app.subscribe(event, function() {
      actualEvents.push(event);
    });
  });

  app.start().then(function() {
    app.to('loaded').then(function() {
      app.to('ending').then(function() {
        ok(_.isEqual(actualEvents, events), actualEvents);
      });
    });
  });

});
