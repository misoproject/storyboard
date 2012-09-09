module("Scenes");

test("scenes names get set when they're attached", function() {
  var myScene = new Miso.Scene({});
  var app = new Miso.Engine({
    initial : 'base',
    scenes : { base : myScene }
  });

  equals(app.scenes['base'].name, 'base');
});
