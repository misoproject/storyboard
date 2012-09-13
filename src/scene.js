(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Scene = function( config ) {
    this.triggers = {};
    this.handlers = {}
    var handlers = ['enter','exit'];
    _.each(handlers, function(action) {
      config[action] = config[action] || function() { return true; };
      this.handlers[action] = wrap(config[action]);
    }, this);

    //attach extra methods
    _.each(config, function(prop, name) {
      if (_.indexOf(handlers, name) !== -1) { return; }
      this[name] = prop;
    }, this);
  };

  _.extend(Miso.Scene.prototype, Miso.Engine.prototype, {
    to : function( sceneName, argsArr, deferred ) {
      this._transitioning = true;
      var complete = this._complete = deferred || _.Deferred(),
          args = argsArr ? argsArr : [],
          handlerComplete = _.Deferred()
            .done(_.bind(function() {
              this._transitioning = false;
              this._current = sceneName;
              complete.resolve();
            }, this))
            .fail(_.bind(function() {
              this._transitioning = false;
              complete.reject();
            }, this));
        
      this.handlers[sceneName].call(this, handlerComplete, args)

      return complete.promise();
    }
  });

  //wrap functions so they can declare themselves as optionally
  //asynchronous without having to worry about deferred management.
  function wrap(func) {
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




