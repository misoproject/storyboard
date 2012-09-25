(function(global, _) {

  var Miso = global.Miso = global.Miso || {};
  var Util = Miso.Util = Miso.Util || {};

  // wrap functions so they can declare themselves as optionally
  // asynchronous without having to worry about deferred management.
  Util._wrap = function(func, name) {
    
    //don't wrap non-functions
    if ( !_.isFunction(func)) { return func; }
    //don't wrap private functions
    if ( /^_/.test(name) ) { return func; }
    //don't wrap wrapped functions
    if (func.__wrapped) { return func; }

    var wrappedFunc = function(args, deferred) {
      var async = false,
          result;

          deferred = deferred || _.Deferred();
          
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

    wrappedFunc.__wrapped = true;
    return wrappedFunc;
  };

}(this, _));
