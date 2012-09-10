module("Building complex scenes");

test("predefining scenes", function() {
  order = [];
  var sceneA = new Miso.Scene({
    onEnter : function() {
      order.push('a');
    }, 
    onExit : function() {
      order.push('b');
    }
  });

  var sceneB = new Miso.Scene({
    onEnter : function() {
      order.push('c');
    }
  });

  var app = new Miso.Engine({
    initial : 'unloaded',
    scenes : {
      unloaded : sceneA,
      loaded : sceneB
    }
  });

  app.to('loaded');
  equals(order.join(''), 'abc');
});

test("Using as engine as a scene", function() {
  order = [];
  var subEngine = new Miso.Engine({
    scenes : {
      enter : {
        onEnter : function() {
          order.push('a');
        },
        onExit : function() {
          order.push('b');
        }
      },
      exit : {
        onEnter : function() {
          order.push('c');
        }
      }
    },
    defer : true,
    initial : 'enter'
  });

  var app = new Miso.Engine({
    initial : 'unloaded',
    scenes : {
      unloaded : subEngine,
      loaded : {
        onEnter : function() {
          order.push('d');
        }
      }
    }
  });

  app.to('loaded');
  equals(order.join(''), 'abcd');

});


test("Nesting 3 engines inside each other", function() {
  var order = [];

  var inner = new Miso.Engine({
    initial : 'enter',
    scenes : {
      enter : {
        onEnter : function() {
          order.push('c');
        }
      }
    },
    defer : true
  });

  var outer = new Miso.Engine({
    initial : 'enter',
    scenes : {
      enter : {
        onEnter : function() {
          order.push('b');
        }
      },
      exit : inner
    },
    defer : true
  });

  var app = new Miso.Engine({
    initial : 'a',
    scenes : {
      a : {
        onEnter : function() {
          order.push('a');
        }
      },
      b : outer,
      c : {}
    }
  });
 
  app.to('b');
  app.to('c');

  equals(order.join(''), 'abc');

});
