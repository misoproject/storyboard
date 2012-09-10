(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Engine = function( config ) {
    this._buildScenes( config.scenes );
    this.data = config.data || {};
    this._triggers = {};

    if (config.defer) {
      this._initial = config.initial;
    } else {
      this.to(config.initial);
    }
  }

  var Engine = Miso.Engine;

  Engine.ERRORS = {};

  _.extend(Engine.prototype, {
    start : function() {
      if (this._current) { //already started 
        return _.Deferred().reject().promise(); 
      }
      return this.to(this._initial);
    },

    cancelTransition : function() {
      this._complete.reject();
      this._transitioning = false;
    },

    to : function( sceneName ) {
      var toScene = this.scenes[sceneName],
          fromScene = this._current,
          complete = this._complete = _.Deferred(),
          exitComplete = _.Deferred(),
          enterComplete = _.Deferred(),
          args = Array.prototype.slice.call(arguments, 1),
          bailout = _.bind(function() {
            this._transitioning = false;
            complete.reject();
          }, this),
          success = _.bind(function() {
            this._transitioning = false;
            this._current = toScene;
            complete.resolve();
          }, this);

      //Can't fire a transition that isn't defined
      if (!toScene) {
        throw "Scene '" + sceneName + "' not found!"
      }

      //we in the middle of a transition?
      if (this._transitioning) { 
        return complete.reject();
      }
      
      this._transitioning = true;

      
      //initial event so there's no from scene
      if (!fromScene) {
        exitComplete.resolve();
        toScene.enter(enterComplete, args).fail(bailout)
      } else {
        //run before and after in order
        //if either fail, run the bailout
        fromScene.exit(exitComplete, args)
        .done(toScene.enter(enterComplete, args).fail(bailout))
        .fail(bailout);
      }

      //all events done, let's tidy up
      _.when(exitComplete, enterComplete).then(success);

      return complete.promise();
    },

    scene : function() {
      return this._current.name;
    },

    is : function( scene ) {
      return (scene === this._current.name);
    },

    inTransition : function() {
      return (this._transitioning === true);
    },

    _buildScenes : function( scenes ) {
      this.scenes = {};
      _.each(scenes, function(originalScene, name) {
        var scene;
        if (scene instanceof Miso.Scene) {
          scene = originalTransition;
        } else {
          scene = new Miso.Scene(originalScene);
        }
        scene.attach(name, this);
        this.scenes[name] = scene;
      }, this);
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


  });

}(this, _, $));
