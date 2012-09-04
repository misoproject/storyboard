(function(global, _, $) {

  var Miso = global.Miso = global.Miso || {};

  Miso.Engine = function( config ) {
    this._buildTransitions( config.transitions );
    this.current = config.initial || 'initial';
    this.lastEvent = 'none';
  }

  _.extend(Miso.Engine.prototype, {
    error : function() {
    },

    transition : function( transitionName ) {
      var transition = this.transitions[transitionName];
      if (!transition) {
        throw "Transition '" + transitionName + "' not found!"
      }

      var from = this.current,
      to = transition.to,
      lastEvent = this.lastEvent,
      complete = _.Deferred(),
      afterComplete = _.Deferred(),
      beforeComplete = _.Deferred(),
      introComplete = _.Deferred(),
      outroComplete = _.Deferred();
      this.transitioning = true;

      //run the from.after and to.before checks
      (lastEvent && lastEvent.after) ? lastEvent.after(afterComplete) : afterComplete.resolve();
      _.when(afterComplete).then(function() {
        transition.before ? transition.before(beforeComplete) : beforeComplete.resolve();
      });

      //Run outro then intro
      _.when(afterComplete, beforeComplete).then(function() {
        _.when(outroComplete).then(function() {
          transition.intro ? transition.intro(introComplete) : introComplete.resolve();
        });
        (lastEvent && lastEvent.outro) ? lastEvent.outro(outroComplete) : outroComplete.resolve();
      });

      //all events done, let's tidy up
      _.when(afterComplete, beforeComplete, introComplete, outroComplete).then(_.bind(function() {
        this.lastEvent = transition;
        this.current = transition.to;
        this.transitioning = false;
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
