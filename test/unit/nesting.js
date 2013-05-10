/* global Miso,module,test,equals */

module("Building complex scenes");

test("scenes names get set when they're attached", function() {
  var myStoryboard = new Miso.Storyboard({});
  var app = new Miso.Storyboard({
    initial : "base",
    scenes : { base : myStoryboard }
  });

  equals(app.scenes["base"].name, "base");
});

test("predefining scenes", function() {
  var order = [];
  var sceneA = new Miso.Storyboard({
    enter : function() {
      order.push("a");
    },
    exit : function() {
      order.push("b");
    }
  });

  var sceneB = new Miso.Storyboard({
    enter : function() {
      order.push("c");
    }
  });

  var app = new Miso.Storyboard({
    initial : "unloaded",
    scenes : {
      unloaded : sceneA,
      loaded : sceneB
    }
  });

  app.start().then(function() {
    app.to("loaded");
    equals(order.join(""), "abc");
  });
});

test("Using as engine as a scene", function() {
  var order = [];
  var subStoryboard = new Miso.Storyboard({
    scenes : {
      enter : {
        enter : function() {
          order.push("a");
        },
        exit : function() {
          order.push("b");
        }
      },
      exit : {
        enter : function() {
          order.push("c");
        }
      }
    },
    defer : true,
    initial : "enter"
  });

  var app = new Miso.Storyboard({
    initial : "unloaded",
    scenes : {
      unloaded : subStoryboard,
      loaded : {
        enter : function() {
          order.push("d");
        }
      }
    }
  });

  app.start().then(function() {
    app.to("loaded");
    equals(order.join(""), "abcd");
  });

});


test("Nesting 3 engines inside each other", function() {
  var order = [];

  var inner = new Miso.Storyboard({
    initial : "enter",
    scenes : {
      enter : {
        enter : function() {
          order.push("c");
        }
      }
    },
    defer : true
  });

  var outer = new Miso.Storyboard({
    initial : "enter",
    scenes : {
      enter : {
        enter : function() {
          order.push("b");
        }
      },
      exit : inner
    },
    defer : true
  });

  var app = new Miso.Storyboard({
    initial : "a",
    scenes : {
      a : {
        enter : function() {
          order.push("a");
        }
      },
      b : outer,
      c : {}
    }
  });

  app.start().then(function() {
    app.to("b");
    app.to("c");
    equals(order.join(""), "abc");
  });
});

test("applying a context to nested rigs", 6, function() {
  var context = {
    a : true,
    b : 96
  };

  var app = new Miso.Storyboard({
    context : context,
    initial : "unloaded",
    scenes : {
      unloaded : {
        enter : function() {
          equals(this.a, true);
          equals(this.b, 96);
        },
        exit : function() {
          equals(this.a, true);
          equals(this.b, 96);
        }
      },

      loaded : new Miso.Storyboard({
        initial : "enter",
        scenes : {

          enter : {
            enter : function() {
              equals(this.a, true, "true in nested scene");
              equals(this.b, 96, "true in nested scene");
            }
          },

          exit : {}

        }
      })
    }
  });

  app.start().then(function() {
    app.to('loaded');
  });
});

