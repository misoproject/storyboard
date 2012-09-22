module("Context and arguments");

test("extending a scene with additional methods", function() {
  var done = false;
  var app = new Miso.Scene({
    boom : function() {
      done = true;
    },
    enter : function() {
      console.log('en', this);
      this.boom();
    }
  });

  app.to('enter');
  equals(done, true);
});

test("handlers have access arguments passed to transition", 4, function() {
  var app = new Miso.Scene({
    initial : 'unloaded',
    children : {
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
      }
    }
  });
  app.start();

});


test("applying a context to nested rigs", 4, function() {
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
      loaded : {}
    }
  });

  app.start().then(function() {
    app.to('loaded');
  });

});

