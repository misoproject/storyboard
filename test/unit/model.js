(function() {

module("Model");
  test("Model stores data passed in", function() {
    var m = new Miso.Model({
      a : 22
    });

    equals(m.get('a'), 22);
  });

  test("Model can access set properties", function() {
    var m = new Miso.Model({});
    m.set('a', 22);
    equals(m.get('a'), 22);
  });

  test("Model can update properties", function() {
    var m = new Miso.Model({ a : 22 });
    m.set('a', 96);
    equals(m.get('a'), 96);
  });

  test("Model fires a set event when a property is set", 3, function() {
    var m = new Miso.Model({ a : 22 });
    m.subscribe('set', function(property, value, oldvalue) {
      equals(property, 'a');
      equals(value, 9);
      equals(oldvalue, 22);
    });
    m.set('a', 9);
  });

  test("Model fires a set:property event when a property is set", 2, function() {
    var m = new Miso.Model({ a : 22 });
    m.subscribe('set:a', function(value, oldvalue) {
      equals(value, 9);
      equals(oldvalue, 22);
    });
    m.set('a', 9);
  });


}());


