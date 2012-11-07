module("base");

test("Create storyboard", 3, function() {
  var app = new Miso.Storyboard({

    counter : 0,

    initial : 'a',
    
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

  app.start().then(function() {
    app.to('b').then(function() {
      app.to('ending').then(function() {
        ok(app.counter === 20, app.counter)
      })
    });
  });
});