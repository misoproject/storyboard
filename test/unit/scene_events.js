

module("Storyboard Event Integration");

test("Basic transition events", function() {
  
  var baseEvents = [
    'start',
    'enter',
    'end',
    'start',
    'exit',
    'enter',
    'end',
    'start',
    'exit',
    'enter',
    'end'
  ], baseEventsActual = [];

  var sceneEvents = [
    'unloaded:start',
    'unloaded:enter',
    'unloaded:end',
    'loaded:start',
    'unloaded:exit',
    'loaded:enter',
    'loaded:end',
    'ending:start',
    'loaded:exit',
    'ending:enter',
    'ending:end'
  ], sceneEventsActual = []; 

  var app = new Miso.Storyboard({
    initial : 'unloaded',
    scenes : {
      unloaded : {},
      loaded : {},
      ending : {}
    }
  });

  var events = [
    'unloaded:start', 'unloaded:enter', 'unloaded:exit', 'unloaded:end',
    'loaded:start', 'loaded:enter', 'loaded:exit', 'loaded:end',
    'ending:start', 'ending:enter', 'ending:exit', 'ending:end'
  ];
  _.each(events, function(event) {
    app.subscribe(event, function() {
      sceneEventsActual.push(event);
    });
  });

  _.each(['start','exit','enter','end'], function(event) {
    app.subscribe(event, function() {
      baseEventsActual.push(event);
    });
  });

  app.start().then(function() {
    app.to('loaded').then(function() {
      app.to('ending').then(function() {
        ok(_.isEqual(sceneEvents, sceneEventsActual), sceneEventsActual);
        ok(_.isEqual(baseEvents, baseEventsActual), baseEventsActual);
      });
    });
  });

});
