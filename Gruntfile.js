
module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: ['Gruntfile.js', 'lib/**/*.js', 'routes/**/*/js', 'public/javascripts/*.js', 'test/**/*.js']
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      // files: ['<%= eslint.target %>'],
      // tasks: ['eslint']
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('lint', ['eslint']);
  grunt.registerTask('default', ['eslint']);

};
