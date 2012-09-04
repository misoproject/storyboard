(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Engine = function( config ) {
    this._buildTransitions( config.transitions );
    this._buildScenes( config.scenes || {} );
    this.current = config.initial || 'initial';
    this.lastTransition;
  }

  _.extend(Miso.Engine.prototype, {
    error : function() {
    },

    transition : function( transitionName ) {
      var transition = this.transitions[transitionName],
          complete = _.Deferred();

      //Can't fire a transition that isn't defined
      if (!transition) {
        throw "Transition '" + transitionName + "' not found!"
      }
      
      //we in the middle of a transition?
      if (this._transitioning) { 
        return complete.reject();
      }
      
      //already in a state?
      if (this.current === transitionName) {
        return complete.reject();
      }

      //if it's not a legit transition, reject it
      if ( transition.cant(this.current) ) {
        return complete.reject(); 
      }

      this._transitioning = true;
      var from = this.current,
          to = transition.to,
          toScene = this.scenes[to],
          fromScene = this.scenes[from],
          lastTransition = this.lastTransition,
          afterComplete = _.Deferred(),
          beforeComplete = _.Deferred(),
          introComplete = _.Deferred(),
          outroComplete = _.Deferred();
          args = Array.prototype.slice.call(arguments, 1);

      //run the from.after and to.before checks in order
      (lastTransition) ? lastTransition.after(afterComplete, toScene, fromScene, args) : afterComplete.resolve();
      _.when(afterComplete).then(function() {
        transition.before(beforeComplete, toScene, fromScene, args);
      });

      //Once before and after have run....
      _.when(afterComplete, beforeComplete)

        //If our before or after fails, bail out here.
        .fail(_.bind(function() {
          this._transitioning = false;
          complete.reject();
        }, this))

        //Run our intro and outro in order
        .then(function() {
          _.when(outroComplete).then(function() {
            transition.intro(introComplete, toScene, fromScene, args);
          });
          lastTransition ? lastTransition.outro(outroComplete, toScene, fromScene, args) : outroComplete.resolve();
        });
        
      //all events done, let's tidy up
      _.when(afterComplete, beforeComplete, introComplete, outroComplete).then(_.bind(function() {
        this.lastTransition = transition;
        this.current = transition.to;
        this._transitioning = false;
        complete.resolve();
      }, this));
      return complete;
    },

    state : function() {
      return this.current;
    },

    is : function( state ) {
      return (state === this.current);
    },

    inTransition : function() {
      return (this._transitioning === true);
    },

    _buildTransitions : function( transitions ) {
      this.transitions = {};
      _.each(transitions, function(originalTransition) {
        var transition;
        if (transition instanceof Miso.Transition) {
          transition = originalTransition;
        } else {
          transition = new Miso.Transition(originalTransition);
        }
        this.transitions[transition.name] = transition.attach(this);
      }, this);
    },

    _buildScenes : function( scenes ) {
      this.scenes = {};
      //initial state
      this.scenes[this.current] = {};
      _.each(this.transitions, function(t) {
        this.scenes[t.to] = (scenes[t.to] || {});
      }, this);

    }

  });

}(this, _, $));
