"use strict";

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    "babel": {
      "options": {
        "sourceMap": true,
        "presets": ["babel-preset-es2015"]
      },
      "dist": {
        "files": [{
          "expand": true,
          "cwd": "lib/",
          "src": ["**/*.es6"],
          "dest": "dist/",
          "ext": ".js"
        }]
      }
    },
    "clean": [
      "dist/"
    ],
    "eslint": {
      "target": [
        "Gruntfile.js",
        "lib/**/*.es6"
      ],
      "options": {
        "configFile": ".eslintrc"
      }
    },
    "watch": {
      "es6": {
        "files": [
          "Gruntfile.js",
          "**/.eslintrc",
          "lib/**/*.es6"
        ],
        "tasks": ["default"]
      }
    },
    "jscs": {
      "src": ["lib/**/*.es6", "Gruntfile.js"],
      "options": {
        "config": true,
        "esnext": true,
        "verbose": true,
        "fileExtensions": [".es6", ".js"]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-babel");
  grunt.loadNpmTasks("grunt-eslint");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-clean");

  // Default task.
  grunt.registerTask("default", [
    "build"
  ]);

  // Common build task
  grunt.registerTask("build", [
    "eslint",
    "clean",
    "babel"
  ]);

};
