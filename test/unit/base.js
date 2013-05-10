/* global Miso,module,test,ok,_ */

var app;
module("base", {
  setup : function() {
    app = new Miso.Storyboard({
      counter : 0,
      initial : "a",
      scenes : {
        a : {
          enter : function() {
            this.counter = 0;
          },
          exit : function() {
            this.helper();
            ok(this.counter === 1, "a counter is 1");
          },
          helper : function() {
            this.counter++;
            this.parent.helper();
          }
        },

        b : {
          enter : function() {
            this.counter = 0;
          },
          exit : function() {
            this.helper();
            ok(this.counter === 1, "b counter is 1");
          },
          helper : function() {
            this.counter++;
            this.parent.helper();
          }
        },

        ending : {}
      },

      helper : function() {
        this.counter += 10;
      }

    });
  },
  teardown : function() {
    app = null;
  }
});

test("Create storyboard", 3, function() {
  
  app.start().then(function() {
    app.to("b").then(function() {
      app.to("ending").then(function() {
        ok(app.counter === 20, app.counter);
      });
    });
  });
});

test("Cloning", 6, function() {
  
  app.start().then(function() {
    app.to("b").then(function() {
      app.to("ending").then(function() {
        ok(app.counter === 20, app.counter);
      });
    });
  });

  var app2 = app.clone();
  // counter now starts at 20!
  app2.start().then(function() {
    app2.to("b").then(function() {
      app2.to("ending").then(function() {
        ok(app2.counter === 20, app2.counter);
      });
    });
  });
});

test("Cloning deeply", function() {
  app = new Miso.Storyboard({
    counter : 0,
    initial : "a",
    scenes : {
      a : new Miso.Storyboard({
        enter : function() {
          this.counter = 0;
        },
        exit : function() {
          this.helper();
          ok(this.counter === 1, "a counter is 1");
        },
        helper : function() {
          this.counter++;
          this.parent.helper();
        }
      }),
    
      b : {
        enter : function() {
          this.counter = 0;
        },
        exit : function() {
          this.helper();
          ok(this.counter === 1, "b counter is 1");
        },
        helper : function() {
          this.counter++;
          this.parent.helper();
        }
      },
    
      ending : {}
    },
    
    helper : function() {
      this.counter += 10;
    }
  });

   app.start().then(function() {
    app.to("b").then(function() {
      app.to("ending").then(function() {
        ok(app.counter === 20, app.counter);
      });
    });
  });

  var app2 = app.clone();
  // counter now starts at 20!
  app2.start().then(function() {
    app2.to("b").then(function() {
      app2.to("ending").then(function() {
        ok(app2.counter === 20, app2.counter);
      });
    });
  });
});