module("Basic events");


test("subscriptions", 1, function() {
  var app = _.extend({}, Miso.Events);
  app.subscribe('test', function() {
    ok(true);
  });
  app.publish('test');
});

test("unsubscription with callback", 2, function() {
  var app = _.extend({}, Miso.Events);
  function tester() {
    ok(true);
  }

  app.subscribe('test', tester);
  app.subscribe('test', tester);
  app.publish('test');
  app.unsubscribe('test', tester);
  app.publish('test');
});

test("unsubscription with token", 1, function() {
  var app = _.extend({}, Miso.Events);
  function tester() {
    ok(true);
  }

  var token = app.subscribe('test', tester);
  app.publish('test');
  app.unsubscribe('test', { token : token });
  app.publish('test');
});

test("subscribeOnce", 1, function() {
  var app = _.extend({}, Miso.Events);
  function tester() {
    ok(true);
  }

  app.subscribeOnce('test', tester);
  app.publish('test');
  app.publish('test');
});

test("priority", function() {
  var app = _.extend({}, Miso.Events);
  var output = [];
  app.subscribe('test', function() {
    output.push('d');
  }, { priority : -10 });
  app.subscribe('test', function() {
    output.push('c');
  }, { priority : 0 });
  app.subscribe('test', function() {
    output.push('a');
  }, { priority : 100 });
  app.subscribe('test', function() {
    output.push('b');
  }, { priority : 10 });
  
  app.publish('test');
  equals(output.join(''), 'abcd');
});


module("Scene Event Integration");

test("Basic transition events", 8, function() {
  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
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
