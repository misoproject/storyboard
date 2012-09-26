# Miso.Scene #

Miso.Scene is a framework for organising your interactive content as scenes, making it easy to handle complex transitions and manage state. Each scene can have handlers for how it should act when it becomes the active scene and when it is no longer the active scene. Scenes nest, so your top level scene will have children that represent that states of your application or interactive.

```javascript
 var app = new Miso.Scene({
  initial : 'unloaded',
  children : {
    'unloaded' : {
      exit : function() {
        console.log('exiting of unloaded complete');
      }
    },
    'loaded' : {
      enter : function() {
        console.log('entering the loaded scene');
      }
    }
  }
});

app.start();
app.to('loaded');
```

## Handling Asynchronous transitions ##

Every scene has two handlers `enter` and `exit`, which are called when the
scene is entered and exited respectively. Both of these handlers can be made to be asynchronous, making it possible to use them to handle complex animated transions in a relatively simple manner. Handlers are made asynchronous by calling a `this.async` in the handler. This will return a function when can be called when the final callback is complete, this is called the resolution function. The `to` function will in turn then return a deferred that will not resolve (or reject) until all the handlers involved are complete.

```javascript
var app = new Miso.Scene({
  initial : 'unloaded',
  scenes : {
    'unloaded' : {
      exit : function() {
        var done = this.async();
        $('#loading').fadeOut(500, function() {
          done();
        });
      }
    },
    'loaded' : {
      enter : function() {
        var done = this.async();
        $('#mainscreen').fadeIn(500, function() {
          done();
        });
      }
    }
  }
});

app.start();
var loadingComplete = app.to('loaded');
loadingComplete.done(function() {
  console.log('app now loaded');
});
```


```javascript
var app = new Miso.Scene({
  initial : 'unloaded',
  scenes : {
    unloaded : {},
    loaded : {}
  }
});

app.start();
var complete = app.to('loaded');
complete.done(function() {
  console.log('transition complete!');
});
```

It is also possible to pass in your own deferred to the `to` method, along with an array of arguments that will be passed to the `exit` and `enter` handlers.

```javascript
var app = new Miso.Scene({
  initial : 'unloaded',
  scenes : {
    unloaded : {},
    loaded : {
      enter : function(id) {
        console.log('user ID is '+id);
      }
    }
  }
});

var complete = _.Deferred();
complete.done(function() { 
  console.log('done!');
});

app.start();
app.to('overview', [userID], complete);
```

## Conditional movement between scenes ##

The `enter` and `exit` handlers can also be used to control whether it's possible to move between scenes. If a handler returns false, or if it is asynchronous, passes `false` to its resolution function the transition will be rejected. This can be managed inside handlers or by binding functions to the `fail` method of the deferred returned by `to`.

```javascript
var app = new Miso.Scene({
  initial : 'unloaded',
  scenes : {
    unloaded : {
      exit : function() {
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
      enter : function() {
        return false;
      }
    }
  }
});

app.start();
var complete = app.to('loaded');
complete.fail(function() {
  console.log('transition failed!');
});
```

## Organising your code ##

You can pass additional methods to the definitions of both scenes and engines to help structure your code in a more logical manner and break down big functions.

```javascript
var app = new Miso.Scene({
  initial : 'unloaded',
  scenes : {
    unloaded : {
      loadData : function() { ... },
      displayLoadingScreen : function() { ... },
      enter : function() {
        this.displayLoadingScreen();
        this.loadData();
      }
    },
    loaded : {}
  }
});
app.start();
```

You can also define Scenes separately and then pass them in to an engine:

```javascript
var loadedScene = new Miso.Scene({
  loadData : function() { ... },
  displayLoadingScreen : function() { ... },
  enter : function() {
    this.displayLoadingScreen();
    this.loadData();
  }
});

var app = new Miso.Scene({
  inital 'unloaded',
  scenes : {
    unloaded : {},
    loaded : loadedScene
  }
});
```

## Nesting Scenes ##

It is also possible to nest Miso Scenes inside each other, making it possible to control state at each level of your code. For example if you had a slideshow inside a larger scene, it could in turn be an engine, with each slide being a state, with handlers defining each move between slides in a custom manner. Nested Scenes must define an `enter` and `exit` scene, which will be called when the `enter` and `exit` scnes would be run in a normal `Miso.Scene`. This will be done automatically in a future version.

```javscript
var walkthrough = new Miso.Scene({
  initial : 'one',
  scenes : {
    enter : {}
    one : {},
    two : {},
    three : {}
    exit : {}
  }
});

var app = new Miso.Scene({
  inital 'unloaded',
  scenes : {
    unloaded : {},
    walkthrough : loadedScene
  }
});
```

## Contributing ##

To build Scene you'll need npm, node.js's package management system and grunt

`npm install`

To build Miso.Scene, call

`grunt`

from the project root.

