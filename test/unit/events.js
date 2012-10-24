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
