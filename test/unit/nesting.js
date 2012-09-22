module("Building complex scenes");

test("scenes names get set when they're attached", function() {
  var myScene = new Miso.Scene({});
  var app = new Miso.Scene({
    initial : 'base',
    children : { base : myScene }
  });

  equals(app.children['base'].name, 'base');
});

test("predefining scenes", function() {
  var order = [];
  var sceneA = new Miso.Scene({
    enter : function() {
      order.push('a');
    }, 
    exit : function() {
      order.push('b');
    }
  });

  var sceneB = new Miso.Scene({
    enter : function() {
      order.push('c');
    }
  });

  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
      unloaded : sceneA,
      loaded : sceneB
    }
  });

  app.start().then(function() {
    app.to('loaded');
    equals(order.join(''), 'abc');
  });
});

test("Using as engine as a scene", function() {
  var order = [];
  var subScene = new Miso.Scene({
    children : {
      enter : {
        enter : function() {
          order.push('a');
        },
        exit : function() {
          order.push('b');
        }
      },
      exit : {
        enter : function() {
          order.push('c');
        }
      }
    },
    defer : true,
    initial : 'enter'
  });

  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
      unloaded : subScene,
      loaded : {
        enter : function() {
          order.push('d');
        }
      }
    }
  });

  app.start().then(function() {
    app.to('loaded');
    equals(order.join(''), 'abcd');
  });

});


test("Nesting 3 engines inside each other", function() {
  var order = [];

  var inner = new Miso.Scene({
    initial : 'enter',
    children : {
      enter : {
        enter : function() {
          order.push('c');
        }
      }
    },
    defer : true
  });

  var outer = new Miso.Scene({
    initial : 'enter',
    children : {
      enter : {
        enter : function() {
          order.push('b');
        }
      },
      exit : inner
    },
    defer : true
  });

  var app = new Miso.Scene({
    initial : 'a',
    children : {
      a : {
        enter : function() {
          order.push('a');
        }
      },
      b : outer,
      c : {}
    }
  });
 
  app.start().then(function() {
    app.to('b');
    app.to('c');
    equals(order.join(''), 'abc');
  });
});

test("applying a context to nested rigs", 6, function() {
  var context = {
    a : true,
    b : 96
  };

  var app = new Miso.Scene({
    context : context,
    initial : 'unloaded',
    children : {
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

      loaded : new Miso.Scene({
        initial : 'enter',
        children : {

          enter : {
            enter : function() {
              equals(this.a, true, 'true in nested scene');
              equals(this.b, 96, 'true in nested scene');
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

