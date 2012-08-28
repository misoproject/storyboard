(function(global, _, $) {

  var Miso = global.Miso = global.Miso || {};
  
  function wrapper(func) {
    return function() {
      this.async = _.bind(function() {
        console.log('async called');
        this.isAsync = true;
        return _.bind(function() {
          delete this.isAsync;
        }, this);

      }, this);
      func.apply(this, arguments);
      if (this.isAsync) {
        return StateMachine.ASYNC;
      }
    }
  }

  
  Miso.Engine = function( config ) {
    this._buildTransitions( config.transitions );
    this._fsm = StateMachine.create({
      initial : config.initial,
      events : this._fsmTransitions(),
      error : this.error
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

      this._fsm.onchangestate = function() {
        console.log('ocs');
        deferred.resolve();
        _self._fsm.onchangestate = null;
      };
      this._fsm[transition](deferred);
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
      var engine = this;
      _.each(this.transitions, function(transition) {
        this.states.push( transition.to );
        if (transition.before || transition.intro) {

          this._fsm['onbefore' + transition.name] = _.bind(function(transitionName, from, to, promise) {
            console.log('onbefore', arguments, this);
            if (transition.before && !transition.before.call(this)) {
              promise.reject();
              return;
            }

            if ( transition.intro ) { 

              var returnValue;
              var wrapped = function() {
                console.log('wrapped', this);
                this.async = function() {
                  console.log('as!');
                  promise.done(function() {
                    console.log('done!, restarting transition', engine._fsm.transition);
                    engine._fsm.transition();
                  });
                  returnValue = StateMachine.ASYNC;
                  return promise;
                }
                transition.intro.call(this);
              }

              wrapped.call(this, promise);
              console.log('returning', returnValue);
              return returnValue;
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


