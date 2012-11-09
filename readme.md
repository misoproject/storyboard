# Miso.Storyboard #

Miso.Storyboard is a control flow library for organising your interactive content as scenes, making it easy to 
handle complex transitions and manage state. Each scene can have handlers for how it should act 
when it becomes the active scene and when it is no longer the active scene. Storyboards nest, 
in that every single scene can actually be its own complex storyboard.

```javascript
 var app = new Miso.Storyboard({
  initial : 'unloaded',
  scenes : {
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
scene is entered and exited respectively. Both of these handlers can be made to be asynchronous, making 
it possible to use them to handle complex animated transions in a relatively simple manner. Handlers 
are made asynchronous by calling a `this.async` in the handler. This will return a function when can 
be called when the final callback is complete, this is called the resolution function. The `to` function 
will in turn then return a deferred that will not resolve (or reject) until all the handlers involved are complete.

```javascript
var app = new Miso.Storyboard({
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
var app = new Miso.Storyboard({
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

It is also possible to pass in your own deferred to the `to` method, along 
with an array of arguments that will be passed to the `exit` and `enter` handlers.

```javascript
var app = new Miso.Storyboard({
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

The `enter` and `exit` handlers can also be used to control whether it's possible to move between scenes. 
If a handler returns false, or if it is asynchronous, passes `false` to its resolution function the 
transition will be rejected. This can be managed inside handlers or by binding functions to the `fail` 
method of the deferred returned by `to`.

```javascript
var app = new Miso.Storyboard({
  initial : 'unloaded',
  scenes : {
    unloaded : {
      exit : function() {
        var done = this.async();

        data.remoteFetch({
          error : function() {
            // data fetch failed? don't continue transitioning.
            done(false)
          },
          success : function() {
            // data fetch succeeded, continue transitioning.
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

You can pass additional methods to the definitions scenes in your storyboard
to help structure your code in a more logical manner and break down big functions.

```javascript
var app = new Miso.Storyboard({
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

## Nesting Storyboards ##

It is also possible to nest Miso Storyboards inside each other, making it possible 
to control state at each level of your code. For example if you had a slideshow inside 
a larger storyboard, it could in turn be its own storyboard, with each slide being a scene, with handlers 
defining each move between slides in a custom manner. 

```javscript
var walkthrough = new Miso.Scene({
  initial : 'one',
  scenes : {
    one : {},
    two : {},
    three : {}
  }
});

var app = new Miso.Scene({
  inital 'unloaded',
  scenes : {
    unloaded : {},
    loaded : walkthrough
  }
});
```

## Contributing ##

To build Scene you'll need npm, node.js's package management system and grunt

`npm install`

To build Miso.Storyboard, call

`grunt`

from the project root.

