(function(global, _) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Events = {
    publish : function(name) {
      var args = _.toArray(arguments);
      args.shift();

      if (this._events && this._events[name]) {
        _.each(this._events[name], function(subscription) {
          subscription.callback.apply(subscription.context || this, args);
        }, this);
      }  
    },

    subscribe : function(name, callback, context, token) {
      this._events[name] = this._events[name] || [];
      var subscription = {
        callback : callback,
        token : (token || _.uniqueId('t')),
        context : context || this
      };

      this._events[name].push(subscription);
      return subscription.token;
    },

    subscribeOnce : function(name, callback) {
      var token = _.uniqueId('t');
      return this.subscribe(name, function() {
        this.unsubscribe(name, { token: token });
        callback.apply(this, arguments);
      }, this, token);
    },

    unsubscribe : function(name, options) {
      options = options || {};

      if (_.isUndefined(this._events[name])) { return this; }

      if (options.token) {
        this._events[name] = _.reject(this._events[name], function(b) {
          return b.token === options.token;
        });
      } else if (options.callback) {
        this._events[name] = _.reject(this._events[name], function(b) {
          return b.callback === options.callback;
        });
      } else {
        this._events[name] = [];
      }
    }

  };

}(this, _));
