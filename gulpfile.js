const gulp = require('gulp'),
    replace = require('gulp-replace'),
    pkg = require('./package.json');

const year = new Date().getFullYear();

gulp.task('bump-docs', function () {
    return gulp.src([
        'mkdocs.yml',
    ], {base: './'})
        .pipe(replace(/&copy; 2022(-\d{4})?/g, '&copy; ' + (year > 2022 ? '2022-' : '') + year))
        .pipe(gulp.dest('.'));
});
gulp.task('bump', gulp.series('bump-docs'));

// Default Task
gulp.task('default', gulp.series('bump'));
