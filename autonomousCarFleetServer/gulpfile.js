/**
 * Created by simonthome on 27/01/2017.
 */
const gulp = require('gulp');
const xo = require('gulp-xo');

gulp.task('xo', () => {
  gulp.src(['api/**/*.js', 'config/*.js', '*.js'])
    .pipe(xo());
});

gulp.task('default', ['xo']);
