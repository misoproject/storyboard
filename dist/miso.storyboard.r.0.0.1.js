/**
* Miso.Storyboard - v0.0.1 - 11/8/2012
* http://github.com/misoproject/storyboard
* Copyright (c) 2012 Alex Graul, Irene Ros, Rich Harris;
* Dual Licensed: MIT, GPL
* https://github.com/misoproject/storyboard/blob/master/LICENSE-MIT 
*/

/**
* Miso.Storyboard - v0.0.1 - 11/8/2012
* http://github.com/misoproject/storyboard
* Copyright (c) 2012 Alex Graul, Irene Ros, Rich Harris;
* Dual Licensed: MIT, GPL
* https://github.com/misoproject/storyboard/blob/master/LICENSE-MIT 
*/

(function(global, _) {

  var Miso = global.Miso = (global.Miso || {});

  /**
  * Miso Events is a small set of methods that can be mixed into any object
  * to make it evented. It allows one to then subscribe to specific object events,
  * to publish events, unsubscribe and subscribeOnce.
  */
  Miso.Events = {


    /**
    * Triggers a specific event and passes any additional arguments
    * to the callbacks subscribed to that event.
    * Params:
    *   name - the name of the event to trigger
    *   .* - any additional arguments to pass to callbacks.
    */
    publish : function(name) {
      var args = _.toArray(arguments);
      args.shift();

      if (this._events && this._events[name]) {
        _.each(this._events[name], function(subscription) {
          subscription.callback.apply(subscription.context || this, args);
        }, this);
      }
      return this;
    },

    /**
    * Allows subscribing on an evented object to a specific name.
    * Provide a callback to trigger.
    * Params:
    *   name - event to subscribe to
    *   callback - callback to trigger
    *   options - optional arguments
    *     priority - allows rearranging of existing callbacks based on priority
    *     context - allows attaching diff context to callback
    *     token - allows callback identification by token.
    */
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

    /**
    * Allows subscribing to an event once. When the event is triggered
    * this subscription will be removed.
    * Params:
    *   name - name of event
    *   callback - The callback to trigger
    */
    subscribeOnce : function(name, callback) {
      this._events = this._events || {};
      var token = _.uniqueId('t');
      return this.subscribe(name, function() {
        this.unsubscribe(name, { token : token });
        callback.apply(this, arguments);
      }, this, token);
    },

    /**
    * Allows unsubscribing from a specific event
    * Params:
    *   name - event to unsubscribe from
    *   identifier - callback to remove OR token.
    */
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
      return this;
    }

  };

}(this, _));

(function(global, _) {

  var Miso = global.Miso = (global.Miso || {});

  /**
  * Creates a new storyboard.
  * Params:
  *   options - various arguments
  *     context - optional. Set a different context for the storyboard.
  *               by default it's the scene that is being executed.
  *     
  */ 
  var Storyboard = Miso.Storyboard = function(options) {

    options = options || {};
    
    // save all options so we can clone this later...
    this._originalOptions = options;

    // Set up the context for this storyboard. This will be
    // available as 'this' inside the transition functions.
    this._context = options.context || this;

    // Assign custom id to the storyboard.
    this._id = _.uniqueId('scene');

    // If there are scenes defined, initialize them.
    if (options.scenes) { 

      // Convert the scenes to actually nested storyboards. A 'scene'
      // is really just a storyboard of one action with no child scenes.
      this._buildScenes(options.scenes);

      // Save the initial scene that we will start from. When .start is called
      // on the storyboard, this is the scene we transition to.
      this._initial = options.initial;

      // Transition function given that there are child scenes.
      this.to = children_to;

    } else { 

      // This is a terminal storyboad in that it doesn't actually have any child
      // scenes, just its own enter and exit functions.

      this.handlers = {};

      _.each(Storyboard.HANDLERS, function(action) {
        
        // save the enter and exit functions and if they don't exist, define them.
        options[action] = options[action] || function() { return true; };
        
        // wrap functions so they can declare themselves as optionally
        // asynchronous without having to worry about deferred management.
        this.handlers[action] = wrap(options[action], action);
      
      }, this);

      // Transition function given that this is a terminal storyboard.
      this.to = leaf_to;
    }


    // Iterate over all the properties defiend in the options and as long as they 
    // are not on a black list, save them on the actual scene. This allows us to define
    // helper methods that are not going to be wrapped (and thus instrumented with 
    // any deferred and async behavior.)
    _.each(options, function(prop, name) {
      
      if (_.indexOf(Storyboard.BLACKLIST, name) !== -1) { 
        return; 
      }
      this[name] = prop;
    }, this);

  };

  Storyboard.HANDLERS = ['enter','exit'];
  Storyboard.BLACKLIST = ['_id', 'initial','scenes','enter','exit','context','_current'];

  _.extend(Storyboard.prototype, Miso.Events, {
    
    /**
    * Allows for cloning of a storyboard
    * Returns:
    *   s - a new Miso.Storyboard
    */
    clone : function() {

      // clone nested storyboard
      if (this.scenes) {
        _.each(this._originalOptions.scenes, function(scene, name) {
          if (scene instanceof Miso.Storyboard) {
            this._originalOptions.scenes[name] = scene.clone();
          }
        }, this);
      }

      return new Miso.Storyboard(this._originalOptions);
    },

    /**
    * Attach a new scene to an existing storyboard.
    * Params:
    *   name - The name of the scene
    *   parent - The storyboard to attach this current scene to.
    */
    attach : function(name, parent) {
      
      this.name = name;
      this.parent = parent;
      
      // if the parent has a custom context the child should inherit it
      if (parent._context && (parent._context._id !== parent._id)) {
        
        this._context = parent._context;
        if (this.scenes) {
          _.each(this.scenes , function(scene) {
            scene.attach(scene.name, this);
          }, this);
        }
      }
      return this;
    },

    /**
    * Instruct a storyboard to kick off its initial scene.
    * This returns a deferred object just like all the .to calls.
    * If the initial scene is asynchronous, you will need to define a .then
    * callback to wait on the start scene to end its enter transition.
    */
    start : function() {
      // if we've already started just return a happily resoved deferred
      if (typeof this._current !== "undefined") {
        return _.Deferred().resolve();
      } else {
        return this.to(this._initial);
      }
    },

    /**
    * Cancels a transition in action. This doesn't actually kill the function
    * that is currently in play! It does reject the deferred one was awaiting
    * from that transition.
    */
    cancelTransition : function() {
      this._complete.reject();
      this._transitioning = false;
    },

    /**
    * Returns the current scene.
    * Returns:
    *   scene - current scene name, or null.
    */
    scene : function() {
      return this._current ? this._current.name : null;
    },

    /**
    * Checks if the current scene is of a specific name.
    * Params:
    *   scene - scene to check as to whether it is the current scene
    * Returns:
    *   true if it is, false otherwise.
    */
    is : function( scene ) {
      return (scene === this._current.name);
    },

    /**
    * Returns true if storyboard is in the middle of a transition.
    */
    inTransition : function() {
      return (this._transitioning === true);
    },

    /**
    * Allows the changing of context. This will alter what 'this'
    * will be set to inside the transition methods.
    */
    setContext : function(context) {
      this._context = context;
      if (this.scenes) {
        _.each(this.scenes, function(scene) {
          scene.setContext(context);
        });
      }
    },
    
    _buildScenes : function( scenes ) {
      this.scenes = {};
      _.each(scenes, function(scene, name) {
        this.scenes[name] = scene instanceof Miso.Storyboard ? scene : new Miso.Storyboard(scene);
        this.scenes[name].attach(name, this);
      }, this);
    }
  });

  // Used as the to function to scenes which do not have children
  // These scenes only have their own enter and exit.
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

    // Used as the function to scenes that do have children.
  function children_to( sceneName, argsArr, deferred ) {
    var toScene = this.scenes[sceneName],
        fromScene = this._current,
        args = argsArr ? argsArr : [],
        complete = this._complete = deferred || _.Deferred(),
        exitComplete = _.Deferred(),
        enterComplete = _.Deferred(),
        publish = _.bind(function(name, isExit) {
          var sceneName = isExit ? fromScene : toScene;
          sceneName = sceneName ? sceneName.name : '';

          this.publish(name, fromScene, toScene);
          if (name !== 'start' || name !== 'end') {
            this.publish(sceneName + ":" + name);
          }

        }, this),
        bailout = _.bind(function() {
          this._transitioning = false;
          this._current = fromScene;
          publish('fail');
          complete.reject();
        }, this),
        success = _.bind(function() {
          publish('enter');
          this._transitioning = false;
          this._current = toScene;
          publish('end');
          complete.resolve();
        }, this);


    if (!toScene) {
      throw "Scene '" + sceneName + "' not found!";
    }

    // we in the middle of a transition?
    if (this._transitioning) { 
      return complete.reject();
    }

    publish('start');

    this._transitioning = true;

    if (fromScene) {

      // we are coming from a scene, so transition out of it.
      fromScene.to('exit', args, exitComplete);
      exitComplete.done(function() {
        publish('exit', true);
      });

    } else {
      exitComplete.resolve();
    }

    // when we're done exiting, enter the next set
    _.when(exitComplete).then(function() {

      toScene.to('enter', args, enterComplete);

    }).fail(bailout);

    enterComplete
      .then(success)
      .fail(bailout);

    return complete.promise();
  }

  function wrap(func, name) {
    
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