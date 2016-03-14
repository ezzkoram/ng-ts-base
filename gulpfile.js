var gulp = require('gulp');
var livereload = require('gulp-livereload');
var htmlmin = require('gulp-htmlmin');
var templateCache = require('gulp-angular-templatecache');
var merge2 = require('merge2');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var deleteLines = require('gulp-delete-lines');
var rimraf = require('gulp-rimraf');
var webserver = require('gulp-webserver');

var paths = {
    indexHtml: 'src/index.html',
    raw: ['src/favicon.ico', 'src/robots.txt'],
    images: 'src/img/**/*',
    styles: ['src/**/*.css', 'src/**/*.less'],
    scripts: ['src/**/*.ts','typings/**/*.ts'],
    templates: ['src/**/*.html', '!src/index.html']
};

var typescriptProject = typescript.createProject('tsconfig.json', { sortOutput: true });

// default to watch
gulp.task('default', ['watch']);

// clean task
gulp.task('clean', function() {
    gulp.src('dist', {read: false})
        .pipe(rimraf());
});

// production task, bare minimum
gulp.task('prod', ['clean'], function() {
    // TODO: fix occasional crash ENOENT

    // remove livereload from index.html
    gulp.src(paths.indexHtml)
        .pipe(deleteLines({
            filters: [
                /<script\s+src="http:\/\/localhost:35729\/livereload.js"><\/script>/i
            ]}))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('dist/'));

    // copy all static/raw files
    gulp.src(paths.raw)
        .pipe(gulp.dest('dist/'));

    // copy images
    gulp.src(paths.images).pipe(gulp.dest('dist/img/'));

    // process styles (no source maps)
    gulp.src(paths.styles)
        .pipe(less())
        .pipe(concat('app.css'))
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/'));

    // process scripts (no source maps)
    gulp.src(paths.scripts)
        .pipe(typescript(typescriptProject))
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});

// watch files, and reload them in browser
gulp.task('watch', function() {
    gulp.start('build');

    livereload.listen();
    gulp.watch(paths.indexHtml, ['index']);
    gulp.watch(paths.raw, ['raw']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.styles, ['styles']);
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.templates, ['scripts']);
});

// server, watch, etc
gulp.task('server', function() {
    gulp.start('watch');
    gulp.src('dist')
        .pipe(webserver({
            livereload: false
        }));
});

// build task
gulp.task('build', ['index', 'raw', 'images', 'styles', 'scripts']);

gulp.task('index', function() {
    return gulp.src(paths.indexHtml)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(livereload());
});

gulp.task('raw', function() {
    return gulp.src(paths.raw)
        .pipe(gulp.dest('dist/'))
        .pipe(livereload());
});

gulp.task('images', function() {
    return gulp.src(paths.images)
        //.pipe(imagemin({optimizationLevel: 5}))
        .pipe(gulp.dest('dist/img/'))
        .pipe(livereload());
});

gulp.task('styles', function() {
    return gulp.src(paths.styles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat('app.css'))
        .pipe(minifyCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/'))
        .pipe(livereload());
});

gulp.task('scripts', function() {
    // compile typescript
    var tsResult = gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(typescript(typescriptProject));

    // compile templates
    var templates = gulp.src(paths.templates)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
         }))
        .pipe(templateCache({ standalone: true }));

    // merge the two
    return merge2(tsResult.js, templates)
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/'))
        .pipe(livereload());
});

