(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Engine = function( config ) {
    this._buildScenes( config.scenes );
    this._triggers = {};

     //attach extra methods
    _.each(config, function(prop, name) {
      if (_.indexOf(Engine.BLACKLIST, name) !== -1) { return; }
      this[name] = prop;
    }, this);

    if (config.defer) {
      this._initial = config.initial;
    } else {
      this.to(config.initial);
    }
   
  };

  var Engine = Miso.Engine;

  Engine.ERRORS = {};
  Engine.BLACKLIST = ['initial','scenes','defer'];

  _.extend(Engine.prototype, {
     attach : function(name, engine) {
      this.name = name;
      this.engine = engine;
    },

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

    to : function( sceneName, argsArr, deferred ) {
      var toScene = this.scenes[sceneName],
          fromScene = this._current,
          args = argsArr ? argsArr : [],
          complete = this._complete = deferred || _.Deferred(),
          exitComplete = _.Deferred(),
          enterComplete = _.Deferred(),
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
        throw "Scene '" + sceneName + "' not found!";
      }

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
            toScene.to('enter', args, enterComplete).fail(bailout)
          })
          .fail(bailout);
      }

      //all events done, let's tidy up
      _.when(exitComplete, enterComplete).then(success);

      return complete.promise();
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

    _buildScenes : function( scenes ) {
      this.scenes = {};
      _.each(scenes, function(originalScene, name) {
        var scene;
        if (originalScene instanceof Miso.Scene || originalScene instanceof Miso.Engine) {
          scene = originalScene;
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
    }


  });

}(this, _, $));
