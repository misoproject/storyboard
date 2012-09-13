(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Scene = function( config ) {
    _.each(['onEnter','onExit'], function(action) {
      this[action] = config[action] ? config[action] : function() { return true; };
    }, this);
     //attach extra methods
    var blacklist = ['onEnter','onExit'];
    _.each(config, function(prop, name) {
      if (_.indexOf(blacklist, name) !== -1) { return; }
      this[name] = prop;
    }, this);
  };

  _.extend(Miso.Scene.prototype, Miso.Engine.prototype, {
    to : function(name, args, deferred) {
      return this['_' + name].call(this, deferred, args);
    },

    attach : function(name, engine) {
      this.name = name;
      this.engine = engine;
      this._wrapFunctions();
    },

    _wrapFunctions : function(config) {
      _.each(['onEnter','onExit'], function(action) {
        this[action.replace(/onE/,'_e')] = wrap(this[action], this);
      }, this);
      delete this.onEnter;
      delete this.onExit;
    }

  });

  //wrap functions so they can declare themselves as optionally
  //asynchronous without having to worry about deferred management.
  function wrap(func, scene) {
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




