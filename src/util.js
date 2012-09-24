(function(global, _, $) {

  var Miso = global.Miso = global.Miso || {};
  var Util = Miso.Util = Miso.Util || {};

  // wrap functions so they can declare themselves as optionally
  // asynchronous without having to worry about deferred management.
  Util._wrap = function(func) {
    return function(deferred, args) {
      var async = false,
          result;
          this.async = function() {
            async = true;
            return function(pass) {
              return (pass !== false) ? deferred.resolve() : deferred.reject();
            };
          };

      result = func.apply(this, args);
      this.async = undefined;
      if (!async) {
        return (result !== false) ? deferred.resolve() : deferred.reject();
      }
      return deferred.promise();
    };
  };

}(this, _, $));
