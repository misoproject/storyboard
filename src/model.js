(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Model = function(data) {
    this._data = data || {};
    this._triggers = {};
  }

  _.extend(Miso.Model.prototype, {
    get : function(prop) {
      return this._data[prop];
    },

    set : function(prop, value) {
      this._publish('set', prop, value, this._data[prop]);
      this._publish('set:'+prop, value, this._data[prop]);
      return this._data[prop] = value;
    },

    pub : function() {
      return this._publish.call(this, arguments);
    },

    sub : function() {
      return this.subscribe.call(this, arguments);
    },

    _publish : function(name) {
      var args = _.toArray(arguments);
      args.shift();

      if (this._triggers && this._triggers[name]) {
        _.each(this._triggers[name], function(subscription) {
          subscription.callback.apply(subscription.context || this, args);
        }, this);
      }  
    },

    subscribe : function(name, callback, context, token) {
      this._triggers[name] = this._triggers[name] || [];
      var subscription = {
        callback : callback,
        token : (token || _.uniqueId('t')),
        context : context || this
      };

      this._triggers[name].push(subscription);

      return subscription.token;
    },

    subscribeOnce : function(name, callback) {
      var token = _.uniqueId('t');
      this.subscribe(name, function() {
        this.unsubscribe(name, { token: token });
        callback.apply(this, arguments);
      }, this, token);
    },

    unsubscribe : function(name, options) {
      options = options || {};

      //no behavior to unsubscribe
      if (_.isUndefined(this._triggers[name])) { return this; }

      if (options.token) {
        this._triggers[name] = _.reject(this._triggers[name], function(b) {
          return b.token === options.token;
        });
      } else if (options.callback) {
        this._triggers[name] = _.reject(this._triggers[name], function(b) {
          return b.callback === options.callback;
        });
      } else {
        this._triggers[name] = [];
      }
    },
  });

}(this, _, $));
