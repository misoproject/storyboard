# Miso.Scene #

Miso.Scene is a framework for organising your interactive content as scenes, making it easy to handle complex transitions and manage state. Each scene can hand handlers for how it should act when it becomes the active scene and when it is no longer the active scene.

```javascript
 var app = new Miso.Engine({
  initial : 'unloaded',
  scenes : {
    'unloaded' : {},
    'loaded' : {
      onEnter : function() {
        console.log('entering the loaded scene');
      }
    }
  }
});
```

## Handling Asynchronous transitions ##

Every scene has two handlers `onEnter` and `onExit`, which are called when the
scene is entered and exited respectively. Both of these handlers can be made to
be asynchronous, making it possible to use them to handle complex animated transionsin a relatively simple manner. Handlers are made asynchronous by calling a `this.async` in the handler. This will return a function when can be called when the final callback is complete, this is called the resolution function.

```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  scenes : {
    'unloaded' : {
      onExit : function() {
        var done = this.async();
        $('#loading').fadeOut(500, function() {
          done();
        });
      }
    },
    'loaded' : {
      onEnter : function() {
        var done = this.async();
        $('#mainscreen').fadeIn(500, function() {
          done();
        });
      }
    }
  }
});

app.to('loaded');
```

The `to` method on an `Miso.Engine` returns a `deferred`, this makes it possible to chain actions to run only after a transition has been completed.

```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  scenes : {
    unloaded : {},
    loaded : {}
  }
});

var complete = app.to('loaded');
complete.done(function() {
  console.log('transition complete!');
});
```

It is also possible to pass in your own deferred to the `to` method, along with an array of arguments that will be passed to the `onExit` and `onEnter` handlers.

```javascript
var complete = _.Deferred();
complete.done(function() { 
  console.log('done!');
});
app.to('overview', [userID], complete);
```

## Conditional movement between scenes ##

The `onEnter` and `onExit` handlers can also be used to control whether it's possible to move between scenes. If a handler returns false, or if it is asynchronous, passes `false` to its resolution function the transition will be rejected. This can be managed inside handlers or by binding functions to the `fail` method of the deferred returned by `to`.

```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  scenes : {
    unloaded : {
      onExit : function() {
        var done = this.async();

        data.remoteFetch({
          error : function() {
            done(false)
          },
          success : function() {
            done();
          }
        });

      }
    },
    loaded : {
      onEnter : function() {
        return false;
      }
    }
  }
});

var complete = app.to('loaded');
complete.fail(function() {
  console.log('transition failed!');
});
```

## Deferring starting ##

You can defer starting a `Miso.Engine` by passing the `defer` parameter at creation. The engine can later be started at it's initial scene by calling `start`

```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  scenes : {
    unloaded : {},
    loaded : {}
  },
  defer : true
});

app.start();
app.scene()
// => 'unloaded'
```

## Organising your code ##

You can pass additional methods to the definitions of both scenes and engines to help structure your code in a more logical manner and break down big functions.

```javascript
var app = new Miso.Engine({
  initial : 'unloaded',
  scenes : {
    unloaded : {
      loadData : function() { ... },
      displayLoadingScreen : function() { ... },
      onEnter : function() {
        this.displayLoadingScreen();
        this.loadData();
      }
    },
    loaded : {}
  }
});
```

You can also define Scenes separately and then pass them in to an engine:

```javascript
var loadedScene = new Miso.Scene({
  loadData : function() { ... },
  displayLoadingScreen : function() { ... },
  onEnter : function() {
    this.displayLoadingScreen();
    this.loadData();
  }
});

var app = new Miso.Engine({
  inital 'unloaded',
  scenes : {
    unloaded : {},
    loaded : loadedScene
  }
});
```

## Nesting Scenes ##

It is also possible to nest Miso Engines inside each other, making it possible to control state at each level of your code. For example if you had a slideshow inside a larger scene, it could in turn be an engine, with each slide being a state, with handlers defining each move between slides in a custom manner. Please note unless you want the enter handler running immidietely that nested engines should be marked `defer` to avoid them running before they are meant to. Nested Engines must define an `enter` and `exit` scene, which will be called when the `onEnter` and `onExit` scnes would be run in a normal `Miso.Scene`. This will be done automatically in a future version.

```javscript
var walkthrough = new Miso.Engine({
  initial : 'one',
  scenes : {
    enter : {}
    one : {},
    two : {},
    three : {}
    exit : {}
  },
  defer : true
});

var app = new Miso.Engine({
  inital 'unloaded',
  scenes : {
    unloaded : {},
    walkthrough : loadedScene
  }
});
```

## Contributing ##

Miso.Scene depends on grunt, bower and npm. Be sure to run:

`npm install`

to get all require node packages and:

`bower install`

to get all client-side libraries required for final builds.

To build Miso.Scene, call

`grunt`

from the project root.