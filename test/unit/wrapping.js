(function() {
  module("Scene function wrapping");

  var engineStub = { data : {}, engine : { data : {} } };

  test("sync wrap", 1, function() {
    var pass = function() {
      return true;
    };

    var wrapped = Miso.Scene.__wrap(pass, engineStub);
    var complete = _.Deferred();
    wrapped(complete);
    equal(complete.state(),'resolved');

  });

  test("sync wrap that fails", 1, function() {
    var pass = function() {
      return false;
    };

    var wrapped = Miso.Scene.__wrap(pass, engineStub);
    var complete = _.Deferred();
    wrapped(complete);
    equal(complete.state(),'rejected');

  });

  test("async wrap that passes", 1, function() {
    var pass = function() {
      var done = this.async();
      done(true);
    };

    var wrapped = Miso.Scene.__wrap(pass, engineStub);
    var complete = _.Deferred();
    wrapped(complete);
    equal(complete.state(),'resolved');

  });

  test("async wrap that fails", 1, function() {
    var pass = function() {
      var done = this.async();
      done(false);
    };

    var wrapped = Miso.Scene.__wrap(pass, engineStub);
    var complete = _.Deferred();
    wrapped(complete);
    equal(complete.state(),'rejected');

  });
}());
