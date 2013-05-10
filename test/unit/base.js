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

test("Function only scenes", function() {
  var nums = [];
  var sb = new Miso.Storyboard({
    initial : "a",
    scenes: {
      a : function() {
        nums.push(1);
      },
      b : function() {
        nums.push(2);
      },
      c : function() {
        nums.push(3);
      },
      d : {
        enter : function() {
          nums.push(4);
        }
      }
    }
  });

  sb.start().then(function() {
    sb.to("b").then(function() {
      sb.to("c").then(function() {
        sb.to("d").then(function() {
          ok(_.isEqual(nums, [1,2,3,4]), "nums are equal");
        });
      });
    });
  });
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