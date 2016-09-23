var gulp = require('gulp'),
    notify = require('gulp-notify'),
    nodemon = require('gulp-nodemon');


gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({
    script: 'belongbot4000.js',
    watch: ['belongbot4000.js']
  })
    .on('start', function onStart() {
      if (!called) { cb(); }
      called = true;
    })
});


gulp.task('default', ['nodemon'], function() {
    gulp.start();
});