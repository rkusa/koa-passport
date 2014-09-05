/*eslint no-process-exit: 0*/

'use strict'

var gulp = require('gulp')

gulp.task('default', ['test'], function() {
  process.exit(0)
})

var mocha = require('gulp-mocha')
gulp.task('test', function() {
  return gulp.src(['!test/coverage/**', 'test/**/*.js'], { read: false })
             .pipe(mocha({
               reporter: 'dot' // 'spec'
             }))
})

gulp.task('coverage', ['coveralls'], function() {
  // TODO: coverage for code containing generators seems to be buggy
  process.exit(0)
})

var istanbul = require('gulp-istanbul')
gulp.task('istanbul', function(done) {
  gulp.src(['lib/**/*.js'])
      .pipe(istanbul())
      .on('finish', function () {
        gulp.src(['!test/coverage/**', 'test/**/*.js'])
          .pipe(mocha(), { read: false })
          .pipe(istanbul.writeReports({
            dir: './test/coverage'
          }))
          .on('end', done)
      })
})

var coveralls = require('gulp-coveralls')
gulp.task('coveralls', ['istanbul'], function() {
  return gulp.src('test/coverage/**/lcov.info')
             .pipe(coveralls())
})
