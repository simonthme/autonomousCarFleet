/**
 * Created by simonthome on 23/12/2016.
 */
const gulp = require('gulp');
const sass = require('gulp-sass');
const connect = require('gulp-connect');
const open = require('gulp-open');
const xo = require('gulp-xo');

gulp.task('sass', () => {
  return gulp.src('www/assets/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('www/assets/css'));
});

gulp.task('sass:watch', () => {
  gulp.watch('www/assets/scss/**/*.scss', ['sass']);
});

gulp.task('webServer', () => {
  connect.server({
    root: ['www'],
    port: 8080,
    livereload: true,
    index: 'index.html',
    middleware: connect => {
      return [
        connect().use('/bower_components', connect.static('bower_components')),
        connect().use('/node_modules', connect.static('node_modules'))
      ];
    }
  });
});

gulp.task('xo', () => {
  return gulp.src(['app/*.js', 'app/**/*.js', '*.js'])
    .pipe(xo())
    .pipe(connect.reload());
});

gulp.task('run', ['webServer'], () => {
  return gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:8080'}));
});

gulp.task('default', ['sass', 'xo', 'webServer', 'run']);
