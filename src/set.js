(function(global, _, $) {

  var Miso = global.Miso = (global.Miso || {});

  Miso.Engine = function( config ) {
    this._buildTransitions( config.transitions );
    this.current = config.initial || 'initial';
    this.lastEvent = 'none';
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

      //if it's not a legit transition, reject it
      if ( transition.cant(this.current) ) {
        return complete.reject(); 
      }

      this._transitioning = true;
      var from = this.current,
          to = transition.to,
          lastEvent = this.lastEvent,
          afterComplete = _.Deferred(),
          beforeComplete = _.Deferred(),
          introComplete = _.Deferred(),
          outroComplete = _.Deferred();

      //run the from.after and to.before checks in order
      (lastEvent && lastEvent.after) ? lastEvent.after(afterComplete) : afterComplete.resolve();
      _.when(afterComplete).then(function() {
        transition.before ? transition.before(beforeComplete) : beforeComplete.resolve();
      });

      //Once before and after have run....
      _.when(afterComplete, beforeComplete)

        //If our before or after fails, bail out here.
        .fail(_.bind(function() {
          console.log('failed!');
          this._transitioning = false;
          complete.reject();
        }, this))

        //Run our intro and outro in order
        .then(function() {
          _.when(outroComplete).then(function() {
            transition.intro ? transition.intro(introComplete) : introComplete.resolve();
          });
          (lastEvent && lastEvent.outro) ? lastEvent.outro(outroComplete) : outroComplete.resolve();
        });
        
      //all events done, let's tidy up
      _.when(afterComplete, beforeComplete, introComplete, outroComplete).then(_.bind(function() {
        this.lastEvent = transition;
        this.current = transition.to;
        this._transitioning = false;
        console.log('complete!', this.current, this.lastEvent);
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
        this.transitions[transition.name] = transition;
      }, this);
    }

  });

}(this, _, $));
