

module("Storyboard Event Integration");

test("Basic transition events", 8, function() {
  var app = new Miso.Storyboard({
    initial : 'unloaded',
    scenes : {
      unloaded : {},
      loaded : {
        exit : function() {
          return false;
        } 
      }
    }
  });


  app.start().then(function() { 
    var token = app.subscribe('start', function(from, to) {
      equals(from, 'unloaded');
      equals(to, 'loaded');
    });

    app.subscribeOnce('start', function(from, to) {
      equals(from, 'unloaded');
      equals(to, 'loaded');
    });

    app.subscribe('done', function(from, to) {
      equals(from, 'unloaded');
      equals(to, 'loaded');
    });

    app.subscribe('fail', function(from, to) {
      equals(from, 'loaded');
      equals(to, 'unloaded');
    });

    app.to('loaded');

    app.unsubscribe('start', { token : token });

    app.to('unloaded');
  });

});
