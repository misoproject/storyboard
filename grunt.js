/*global config:true, task:true*/
module.exports = function(grunt) {

  grunt.initConfig({
    pkg : '<json:package.json>',

    meta : {
      banner :  '/**\n' +
                '* <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today("m/d/yyyy") %>\n' +
                '* <%= pkg.homepage %>\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.authors %>;\n' +
                '* Dual Licensed: <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
                '* https://github.com/misoproject/scene/blob/master/LICENSE-MIT \n' +
                '*/',
      lastbuild : '<%= grunt.template.today("yyyy/mm/dd hh:ss") %>'
    },

    node: {
      wrapper: "src/node/compat.js",
      misoScene: "dist/miso.scene.<%= pkg.version %>.js"
    },

    concat : {
      fullnodeps: {
        dest: "dist/miso.scene.<%= pkg.version %>.js",
        src: [
          "<banner>",
          "src/events.js",
          "src/util.js",
          "src/scene.js"
        ]
      },

      requirenodeps: {
        dest: "dist/miso.scene.r.<%= pkg.version %>.js",
        src: [
          "<banner>",
          "dist/miso.scene.<%= pkg.version %>.js",
          "src/require.js"
        ]
      },

      fulldeps: {
        dest : "dist/miso.scene.deps.<%= pkg.version %>.js",
        src : [
          "<banner>",
          "libs/lodash.js",
          "libs/underscore.deferred.js",
          "dist/miso.scene.<%= pkg.version %>.js"
        ]
      },

      buildstatus : {
        dest : "dist/LASTBUILD",
        src : [
          "<banner:meta.lastbuild>"
        ]
      }
    },

    min : {
      minnodeps : {
        dest : "dist/miso.scene.min.<%= pkg.version %>.js",
        src : [
          "<banner>",
          "dist/miso.scene.<%= pkg.version %>.js" 
        ]
      },
      mindeps : {
        dest : "dist/miso.scene.deps.min.<%= pkg.version %>.js",
        src : [
          "<banner>",
          "dist/miso.scene.deps.<%= pkg.version %>.js" 
        ]
      }
    },

    qunit : {
      urls : [ 
        "http://localhost:9292/test/index.html"
      ]
    },

    lint : {
      files : [
        "grunt.js",
        "src/*.js",
        "test/unit/**/*.js"
      ]
    },

    watch : {
      files : "<config:lint.files>",
      tasks : "lint qunit"
    },

    jshint : {
      options : {
        unused : true,
        unuseds : true,
        devel : true,
        noempty : true,
        forin : false,
        evil : true,
        maxerr : 100,
        boss : true,
        curly : true,
        eqeqeq : true,
        immed : true,
        latedef : true,
        newcap : true,
        noarg : true,
        sub : true,
        undef : true,
        eqnull : true,
        browser : true,
        bitwise  : true,
        loopfunc : true,
        predef : [ "_", "Miso", "require", "exports", "define" ]
      },
      globals : {
        QUnit : true,
        module : true,
        test : true,
        asyncTest : true,
        expect : true,
        ok : true,
        equals : true,
        equal : true,
        JSLitmus : true,
        start : true,
        stop : true,
        $ : true,
        strictEqual : true,
        raises : true
      }
    },

    uglify : {
      "mangle" : {
        "except" : [ "_" ]
      },
      "squeeze" : {},
      "codegen" : {}
    }
  });

  // load available tasks.
  grunt.loadTasks("tasks");

  // Default task.
  grunt.registerTask('default', 'lint testserver qunit concat min node');
};


