 
module.exports = function(grunt) {

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var _ = grunt.util._;
  // Shorthand Grunt functions
  var log = grunt.log;

  // Task specific for building Node compatible version
  grunt.registerTask('node', function() {
    var nodeConfig = grunt.config("node");
    var read = grunt.file.read;

    var output = grunt.template.process(read(nodeConfig.wrapper), {
      misoScene: read(grunt.template.process(nodeConfig.misoScene))
    });

    // Write the contents out
    grunt.file.write("dist/node/miso.scene." + grunt.template.process(grunt.config("pkg").version) + ".js", output);
  });

};