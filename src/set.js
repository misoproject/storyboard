(function(global, _, $) {

  var Miso = global.Miso = global.Miso || {};
  
  // function wrapper(func) {
    // return function() {
      // this.async = _.bind(function() {
        // console.log('async called');
        // this.isAsync = true;
        // return _.bind(function() {
          // delete this.isAsync;
        // }, this);

      // }, this);
      // func.apply(this, arguments);
      // if (this.isAsync) {
        // return StateMachine.ASYNC;
      // }
    // }
  // }

  
  Miso.Engine = function( config ) {
    this._buildTransitions( config.transitions );
    this._fsm = StateMachine.create({
      initial : config.initial,
      events : this._fsmTransitions(),
      // error : this.error
    });
    this.states = [config.initial];
    this._bindTransitions();
  }

  _.extend(Miso.Engine.prototype, {
    error : function() {
      console.log('error', arguments);
    },

    transition : function( transition ) {
      var deferred = _.Deferred(),
          _self = this;

      try {
        this._fsm.onchangestate = function() {
          deferred.resolve();
          _self._fsm.onchangestate = null;
        };
        if (this._fsm[transition](deferred) === false) {
          deferred.reject();
        }
      } catch(e) {
        console.log('ERROR', e, deferred.state());
        deferred.reject(e);
      }
      return deferred.promise();
    },

    getState : function() {
      return this._fsm.current;
    },

    isState : function( state ) {
      return ( state === this._fsm.current );
    },

    _buildTransitions : function( transitions ) {
      this.transitions = _.map(transitions, function(originalTransition) {
        var transition;
        if (transition instanceof Miso.Transition) {
          transition = originalTransition;
        } else {
          transition = new Miso.Transition(originalTransition);
        }
        return transition;
      }, this);
    },

    _bindTransitions : function() {
      _.each(this.transitions, function(transition) {
        this.states.push( transition.to );
        if (transition.before) {

          this._fsm['onbefore' + transition.name] = _.bind(function(scope, name, from, to, promise) {
            console.log('onbefore', arguments, this);
            var result = transition.before.apply(this);
            if ( (transition.intro) && (result !== false) ) { 
              transition.intro.apply(this);
            } else {
              return result;
            }
          }, this);

        }

        if (transition.after) {
          this._fsm['onleave' + transition.to] = _.bind(transition.after, this);
        }


      }, this);

      _.each(this.states, function(state) {

      });
    },

    _fsmTransitions : function() {
      return _.map(this.transitions, function(transition) {
        return transition._forFsm();
      });
    }

  
  });

}(this, _, $));


