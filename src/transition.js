(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Transition = function( config ) {
    this.name = config.name;
    this.from = _.isArray(config.from) ? config.from : [config.from];
    this.to = config.to;
    _.each(['before','after','intro','outro'], function(action) {
      this[action] = config[action] ? config[action] : function() { return true; };
    }, this);
  }

  _.extend(Miso.Transition.prototype, {
    attach : function(engine) {
      this._wrapFunctions();
      return this;
    },

    _wrapFunctions : function(config) {
      _.each(['before','after','intro','outro'], function(action) {
        var conditional = (action === 'before' || action === 'after');

        this[action] = Miso.Transition.__wrap(this[action], conditional);
      }, this);
    },

    can : function(stateName) {
      return (_.indexOf(this.from, stateName) !== -1)
    },

    cant : function(stateName) {
      return !this.can(stateName);
    }

  });

  //wrap functions so they can declare themselves as optionally
  //asynchronous without having to worry about deferred management.
  //conditional means the return of the async function can reject
  //or resolve the deferred.
  Miso.Transition.__wrap = function(func, conditional) {
    return function(deferred, toScene, fromScene, args) {
      var async = false,
          result;
          context = {
            toScene : toScene,
            fromScene : fromScene,
            async: function() {
              async = true;
              if (conditional) {
                return function(pass) {
                  pass ? deferred.resolve() : deferred.reject();
                }
              } else {
                return function() {
                  deferred.resolve();
                }
              }
            }
          };

      result = func.apply(context, args)
      if (!async) {
        if (conditional) {
          result ? deferred.resolve() : deferred.reject();
        } else {
          deferred.resolve();
        }
      }
      return deferred.promise();
    }
  }

}(this, _, $));




