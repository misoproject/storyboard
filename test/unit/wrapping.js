module("Transition function wrapping");

test("sync non-conditional wrap that passes", 1, function() {

  var pass = function() {
    return true;
  }

  var wrapped = Miso.Transition.__wrap(pass);
  var complete = _.Deferred();
  wrapped(complete);
  equal(complete.state(),'resolved');

});

test("sync non-conditional wrap that fails", 1, function() {

  var pass = function() {
    return false;
  }

  var wrapped = Miso.Transition.__wrap(pass);
  var complete = _.Deferred();
  wrapped(complete);
  equal(complete.state(),'rejected');

});

test("async non-conditional wrap", 1, function() {

  var pass = function() {
    var done = this.async();
    done();
  }

  var wrapped = Miso.Transition.__wrap(pass);
  var complete = _.Deferred();
  wrapped(complete);
  equal(complete.state(),'resolved');

});

test("async conditional wrap that passes", 1, function() {

  var pass = function() {
    var done = this.async();
    done(true);
  }

  var wrapped = Miso.Transition.__wrap(pass, true);
  var complete = _.Deferred();
  wrapped(complete);
  equal(complete.state(),'resolved');

});

test("async conditional wrap that fails", 1, function() {

  var pass = function() {
    var done = this.async();
    done(false);
  }

  var wrapped = Miso.Transition.__wrap(pass, true);
  var complete = _.Deferred();
  wrapped(complete);
  equal(complete.state(),'rejected');

});



