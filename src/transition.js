(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Scene = function( config ) {
    this.name = name;
    this.data = config.data || {}
    _.each(['onEnter','onExit'], function(action) {
      this[action] = config[action] ? config[action] : function() { return true; };
    }, this);
  }

  _.extend(Miso.Scene.prototype, {
    attach : function(name, engine) {
      this.name = name;
      this.engine = engine;
      this._wrapFunctions();
    },

    _wrapFunctions : function(config) {
      _.each(['onEnter','onExit'], function(action) {
        this[action.replace(/onE/,'e')] = Miso.Scene.__wrap(this[action], this);
      }, this);
    },

  });

  //wrap functions so they can declare themselves as optionally
  //asynchronous without having to worry about deferred management.
  Miso.Scene.__wrap = function(func, scene) {
    return function(deferred, args) {
      var async = false,
          result;
          context = {
            scene : scene.data,
            global : scene.engine.data,
            async: function() {
              async = true;
              return function(pass) {
                pass ? deferred.resolve() : deferred.reject();
              }
            }
          };

      result = func.apply(context, args)
      if (!async) {
        result ? deferred.resolve() : deferred.reject();
      }
      return deferred.promise();
    }
  }

}(this, _, $));




