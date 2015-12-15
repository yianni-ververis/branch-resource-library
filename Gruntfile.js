module.exports = function(grunt) {
  grunt.initConfig({
    includes: {
      files:{
        src: ['app.js'],
        dest: 'public/scripts/build/',
        cwd: 'public/scripts/raw'
      }
    },
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "public/styles/css/main.css": "public/styles/less/main.less" // destination file and source file
        }
      }
    },
    watch: {
      styles: {
        files: ['public/styles/less/**/*.less', 'public/scripts/raw/**/*.js'], // which files to watch
        tasks: ['less','includes','postcss'],
        options: {
          nospawn: true,
          livereload: true
        }
      },
      views: {
        files: ['public/views/**/*.html'],
        options: {
          nospawn: true,
          livereload: true
        }
      }
    },
    postcss: {
      options: {
        map: {
          inline: false,
          annotation: 'public/styles/maps/'
        },
        processors: [
          require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
          require('cssnano')() // minify the result
        ]
      },
      dist: {
        src: 'public/styles/css/main.css'
      }
    },
    uglify:{
      options : {
        beautify : false,
        mangle   : true
      },
      my_target: {
        files: {
          'public/scripts/build/app.min.js': ['public/scripts/build/app.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.registerTask('default', ['includes','less','postcss','watch','copy', 'uglify']);
};
