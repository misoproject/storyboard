module("Context and arguments");

test("extending a scene with additional methods", function() {
  var done = false;
  var app = new Miso.Storyboard({
    boom : function() {
      done = true;
    },
    enter : function() {
      this.boom();
    }
  });

  app.to('enter');
  equals(done, true);
});

test("handlers have access arguments passed to transition", 4, function() {
  var app = new Miso.Storyboard({
    initial : 'unloaded',
    scenes : {
      unloaded : {
        exit : function(a, b) {
          equals(a, 44);
          equals(b.power, 'full');
        }
      },
      loaded : {
        enter : function(a, b) {
          equals(a, 44);
          equals(b.power, 'full');
        }
      }
    }
  });

  app.start().then(function() {
    app.to('loaded', [44, { power : 'full' }]);
  });

});

test("Applying a context to a simple scene", function() {
  var context = {
    a : true,
    b : 96
  };

  var app = new Miso.Storyboard({
    context : context,
    initial : 'unloaded',
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
      }
    }
  });
  app.start();

});

test("Applying a context to a simple scene and then switching it", function() {
  stop();
  var context1 = {
    a : true,
    b : 96
  };

  var context2 = {
    a : false,
    b : 1
  };

  var app = new Miso.Storyboard({
    context : context1,
    initial : 'c1',
    scenes : {
      c1 : {
        enter : function() {
          equals(this.a, true);
          equals(this.b, 96);
        },
        exit : function() {
          equals(this.a, true);
          equals(this.b, 96);
        }
      },
      c2 : {
        enter : function() {
          equals(this.a, false);
          equals(this.b, 1);
        },
        exit : function() {
          equals(this.a, false);
          equals(this.b, 1);
          start();
        }
      },
      end : {}
    }
  });

  app.subscribe('c1:done', function() {
    app.setContext(context2);
  });

  app.start().then(function() {
    app.to('c2').then(function() {
      app.to('end');
    });
  });

});

test("applying a context to nested rigs", 4, function() {
  var context = {
    a : true,
    b : 96
  };

  var app = new Miso.Storyboard({
    context : context,
    initial : 'unloaded',
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
      loaded : {}
    }
  });

  app.start().then(function() {
    app.to('loaded');
  });

});

