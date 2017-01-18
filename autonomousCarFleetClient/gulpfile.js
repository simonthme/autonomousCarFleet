/**
 * Created by simonthome on 23/12/2016.
 */
const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('sass', function () {
    return gulp.src('www/assets/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('www/assets/css'));
});

gulp.task('sass:watch', function () {
    gulp.watch('www/assets/scss/**/*.scss', ['sass']);
});
