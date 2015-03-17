/*eslint no-process-exit: 0*/

'use strict'

var gulp = require('gulp')

gulp.task('default', ['test'])

var mocha = require('gulp-mocha')
gulp.task('test', function() {
  return gulp.src(['test/**/*.js'], { read: false })
             .pipe(mocha({
               reporter: 'dot' // 'spec'
             }))
})
