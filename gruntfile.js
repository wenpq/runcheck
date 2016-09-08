module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      target: ['gruntfile.js', 'lib/**/*.js', 'routes/**/*.js', 'public/javascripts/*.js', 'test/**/*.js']
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },
    shell: {
      templateSource: 'views/client-side/*.pug',
      templateOutput: 'public/javascripts/template',
      options: {
        stderr: false
      },
      template: {
        command: 'pug <%= shell.templateSource %> -D -c --name-after-file -o <%= shell.templateOutput %>'
      },
      puglint: {
        command: './node_modules/pug-lint/bin/pug-lint ./views/*.pug ./views/client-side/*.pug'
      }
    }
  });

  grunt.registerTask('template', ['shell:template']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('puglint', ['shell:puglint']);
  grunt.registerTask('default', ['puglint', 'eslint']);
};
