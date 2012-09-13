/*
 * Grunt Task File
 * ---------------
 *
 * Task: Server
 * Description: Serve the web application.
 * Dependencies: express
 *
 */
module.exports = function(grunt) {

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var _ = grunt.util._;
  // Shorthand Grunt functions
  var log = grunt.log;
  
  grunt.registerTask('testserver', 'Start a custom static web server.', function() {
    var connect = require('connect');
    var path = require('path');
    var port = grunt.config('testserver.port') || 9292;
    var base = path.resolve(grunt.config('testserver.base') || '.');

    // Start server.
    var app = connect()
      .use( connect.static(base) )
      .use( connect.directory(base) )
      .listen( port )

    grunt.log.writeln('Starting test server on port ' + port + '.');
  });

  grunt.registerTask('server', 'Start a custom static web server.', function() {
    var connect = require('connect');
    var path = require('path');
    var done = this.async();
    var port = grunt.config('server.port') || 8000;
    var base = path.resolve(grunt.config('server.base') || '.');
    
    connect.logger.format('grunt', (':status: :method :url').green);

    // Start server.
    var app = connect()
      .use( connect.logger('grunt') )
      .use( connect.static(base) )
      .use( connect.directory(base) )
      .listen( port )
      .on('close', done);
    grunt.log.writeln('Starting server on port ' + port + '.');
  });

};