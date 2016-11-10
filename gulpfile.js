var babel = require('gulp-babel');
var es2015 = require('babel-preset-es2015');
var gulp = require('gulp');

const paths = {
    src: 'src/*.js',
    dest: 'build'
};

gulp.task('default', ['babel']);


gulp.task('babel', function() {
    return gulp.src(paths.src)
        .pipe(babel({
            presets: [es2015]
        }))
        .pipe(gulp.dest(paths.dest));
});
