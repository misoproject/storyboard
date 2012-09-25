/**
* Miso.Scene - v0.0.1 - 9/25/2012
* http://github.com/misoproject/scene
* Copyright (c) 2012 Alex Graul, Irene Ros, Rich Harris;
* Dual Licensed: MIT, GPL
* https://github.com/misoproject/scene/blob/master/LICENSE-MIT 
* https://github.com/misoproject/scene/blob/master/LICENSE-GPL 
*/

/**
* Miso.Scene - v0.0.1 - 9/25/2012
* http://github.com/misoproject/scene
* Copyright (c) 2012 Alex Graul, Irene Ros, Rich Harris;
* Dual Licensed: MIT, GPL
* https://github.com/misoproject/scene/blob/master/LICENSE-MIT 
* https://github.com/misoproject/scene/blob/master/LICENSE-GPL 
*/

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

    subscribe : function(name, callback, options) {
      options = options || {};
      this._events = this._events || {};
      this._events[name] = this._events[name] || [];

      var subscription = {
        callback : callback,
        priority : options.priority || 0, 
        token : options.token || _.uniqueId('t'),
        context : options.context || this
      };
      var position;
     _.each(this._events[name], function(event, index) {
       if (!_.isUndefined(position)) { return; }
       if (event.priority <= subscription.priority) {
         position = index;
       }
     });

      this._events[name].splice(position, 0, subscription);
      return subscription.token;
    },

    subscribeOnce : function(name, callback) {
      this._events = this._events || {};
      var token = _.uniqueId('t');
      return this.subscribe(name, function() {
        this.unsubscribe(name, { token : token });
        callback.apply(this, arguments);
      }, this, token);
    },

    unsubscribe : function(name, identifier) {

      if (_.isUndefined(this._events[name])) { return this; }

      if (_.isFunction(identifier)) {
        this._events[name] = _.reject(this._events[name], function(b) {
          return b.callback === identifier;
        });

      } else if ( _.isString(identifier)) {
        this._events[name] = _.reject(this._events[name], function(b) {
          return b.token === identifier;
        });

      } else {
        this._events[name] = [];
      }
    }

  };

}(this, _));

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

(function(global, _) {

  var Miso = global.Miso = (global.Miso || {});
  var Util = Miso.Util;

  var Scene = Miso.Scene = function( config ) {
    config = config || {};
    this._context = config.context || this;
    this._id = _.uniqueId('scene');

    if ( config.children ) { //has child scenes
      this._buildChildren( config.children );
      this._initial = config.initial;
      this.to = children_to;

    } else { //leaf scene

      this.handlers = {};
      _.each(Scene.HANDLERS, function(action) {
        
        config[action] = config[action] || function() { return true; };
        
        //wrap functions so they can declare themselves as optionally
        //asynchronous without having to worry about deferred management.
        this.handlers[action] = Util._wrap(config[action], action);
      
      }, this);
      this.to = leaf_to;
    }

    _.each(config, function(prop, name) {
      if (_.indexOf(Scene.BLACKLIST, name) !== -1) { return; }
      this[name] = prop;
    }, this);

  };

  Scene.HANDLERS = ['enter','exit'];
  Scene.BLACKLIST = ['initial','children','enter','exit','context'];

  _.extend(Scene.prototype, Miso.Events, {
    attach : function(name, parent) {
      this.name = name;
      this.parent = parent;
      //if the parent has a custom context the child should inherit it
      if (parent._context && (parent._context._id !== parent._id)) {
        this._context = parent._context;
        if (this.children) {
          _.each(this.children, function(scene, name) {
            scene.attach(scene.name, this);
          }, this);
        }
      }
    },

    start : function() {
      //if we've already started just return a happily resoved deferred
      if (typeof this._current !== "undefined") {
        return _.Deferred().resolve();
      } else {
        return this.to(this._initial);
      }
    },

    cancelTransition : function() {
      this._complete.reject();
      this._transitioning = false;
    },

    scene : function() {
      return this._current ? this._current.name : null;
    },

    is : function( scene ) {
      return (scene === this._current.name);
    },

    inTransition : function() {
      return (this._transitioning === true);
    },

    _buildChildren: function( scenes ) {
      this.children = {};
      _.each(scenes, function(scene, name) {
        this.children[name] = scene instanceof Miso.Scene ? scene : new Miso.Scene(scene);
        this.children[name].attach(name, this);
      }, this);
    }
  });

  //Used as the to function to scenes which do not have children
  function leaf_to( sceneName, argsArr, deferred ) {
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

    this.handlers[sceneName].call(this._context, args, handlerComplete);

    return complete.promise();
  }

  function children_to( sceneName, argsArr, deferred ) {
    var toScene = this.children[sceneName],
        fromScene = this._current,
        args = argsArr ? argsArr : [],
        complete = this._complete = deferred || _.Deferred(),
        exitComplete = _.Deferred(),
        enterComplete = _.Deferred(),
        publish = _.bind(function(name) {
          this.publish(name, (fromScene ? fromScene.name : null), toScene.name);
        }, this),
        bailout = _.bind(function() {
          this._transitioning = false;
          complete.reject();
          publish('fail');
        }, this),
        success = _.bind(function() {
          this._transitioning = false;
          this._current = toScene;
          complete.resolve();
          publish('done');
        }, this);

    //Can't fire a transition that isn't defined
    if (!toScene) {
      throw "Scene '" + sceneName + "' not found!";
    }

    publish('start');

    //we in the middle of a transition?
    if (this._transitioning) { 
      return complete.reject();
    }

    this._transitioning = true;

      
    //initial event so there's no from scene
    if (!fromScene) {
      exitComplete.resolve();
      toScene.to('enter', args, enterComplete)
      .fail(bailout);
    } else {
      //run before and after in order
      //if either fail, run the bailout
      fromScene.to('exit', args, exitComplete)
      .done(function() {
        toScene.to('enter', args, enterComplete).fail(bailout);
      })
      .fail(bailout);
    }

    //all events done, let's tidy up
    _.when(exitComplete, enterComplete).then(success);

    return complete.promise();
  }


}(this, _));

(function(global) {

  var Miso = global.Miso || {};
  delete window.Miso;

  // CommonJS module is defined
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      // Export module
      module.exports = Miso;
    }
    exports.miso = Miso;

  } else if (typeof define === 'function' && define.amd) {
    // Register as a named module with AMD.
    define('miso', [], function() {      
      return Miso;
    });
  }
  
}(this));