# Miso.Scene #

Miso Scene is a library that provides a controller system for organising code for interactive content. Scene is based on the concept of a fininte state machine - a system that controls movement between a set series of states.

A Miso engine is defined as a series of transitions, these transitions define how it is possible to move between states. A simple example would be a system with a loaded and unloaded state with a `load` transition defined

```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  transitions : [
    { name : 'load', from : 'unloaded', to : 'loaded' }
  ]
});

app.transition('load')
```

The definition of a transition consists of a `name` parameter, which states it is possible to execute the transition in, `from` and what state the transition takes you to, `to`. It is possible to define multiple from states by passing them as an array and you can define multiple ways of moving between the same states.

Transitions can also be defined separately and then passed to to help code organisation:
```javascript
var load = new Miso.Transition({
  name : 'load',
  from : 'unloaded',
  to   : 'loaded'
});

var app = new Miso.Engine({
  initial : 'unloaded',
  transitions : [ load ]
});
```


## Handlers ##

A transition also can contain any of four handler functions, `before`, `after`, `intro` and `outro`. Handlers are functions executed when a transition occurs. Most of the time you will only use before and intro but there may be situations where after and outro are useful.

`before` is executed when a transition begins and is used for any code needed to check whether it is possible to move to the `to` state of the transition. If the `before` handler returns false, the transition is aborted.

`after` is executed when the next transition begins and is used for any code needed to check whether it's possible to move to the next state. An after handler could be used to check whether something has finished loading before allowing the user to move on for example. If the `after` handler returns false, the transition is aborted.

`outro` is executed when the next transition begins and should be used for any teardown code that needs to be run before the next state - unloading media, removing event handlers etc.

`intro` is executed after the `before`, `after` & previous `outro` functions have run and is used to run any code needed to complete the transition - making elements appear, loading content, starting multimedia.

```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  transitions : [
    { 
      name : 'load', 
      from : 'unloaded', 
      to : 'loaded',
      intro : function() {
        $('#loading').hide();
      }
    }
  ]
});
```

All handlers can be asynchronous. With the `before` and `after` handlers returning false to the done function will cause it to fail and the transition to be cancelled.

```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  transitions : [
    { 
      name : 'load', 
      from : 'unloaded', 
      to : 'loaded',
      intro : function() {
        var done = this.async();
        $('#loading').fadeOut('slow', function() {
          done()
        });
      }
    }
  ]
});
```

The transition call itself returns a deferred promise that can be used to delay code executino until a transition is complete.
```javascript
var promise = app.transition('load');
promise.done(function() {
  console.log('load complete!');
});
promise.fail(function() {
  console.log('transition rejected!');
});
```

## Scene data ##

All transition handlers have access to a scene object for both the scene they are transition from and to. These are simple objects that can be used to store persistant references to elements, blocks or data. This data can be defined on the fly and passed in at init
```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  scenes : {
    loaded : {
      title : 'My Interactive'
    }
  },
  transitions : [
    { 
      name : 'load', 
      from : 'unloaded', 
      to : 'loaded',
      intro : function() {
        console.log(this.toScene.title);
        this.toScene.lastLoaded = new Date().valueOf();
      }
    }
  ]
});
```

## Events ##

The engine object itself also allows for subscripts to events that happen around transitions on both a global and a per-transition basis.
```javascript```
app.subscribe('load.end', function(from, to) {
  console.log('loading transition complete');
});
app.subscribe('transition.fail', function(transition, from, to, msg) {
  console.log('transition ' + transition + ' to ' + to 'failed!');
});
```
