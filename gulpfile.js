let gulp = require("gulp");
let runSequence = require('run-sequence');
let clean = require('gulp-clean');
let browserify = require("browserify");
let source = require('vinyl-source-stream');
let tsify = require("tsify");
let sourcemaps = require('gulp-sourcemaps');
let buffer = require('vinyl-buffer');
let browserSync = require('browser-sync').create();


let config = {
    paths: {
        dist:      'dist',
        temp:      'temp',
        sourceMap: './',
        source:    'source',
        ts:        'ts'
    },
    browserify: {
        entries: ['source/ts/app.ts'],
    },
    babelify: {},
    tsify: {
        outFile: 'bundle.js',
    },
    htmlPages: ['*.html'],
};


// clean build directory
gulp.task("clean", function() {
    return gulp.src(['dist', 'temp'], {read: false}).pipe(clean());
});

// copy html files into build directory
gulp.task("copy-html", function () {
    return gulp.src(config.htmlPages.map((p) => `${config.paths.source}/${p}`))
       .pipe(gulp.dest(`${config.paths.dist}`));
});

// build typescript to js
gulp.task('babelify', function () {
    return browserify(Object.assign({
          basedir: '.',
          debug: true,
          cache: {},
          packageCache: {}
      }, config.browserify))
    .plugin(tsify)
    .transform('babelify', Object.assign({
        presets: ['es2015'],
        extensions: ['.ts']
    }, config.babelify))
    .bundle()
    .on('error', console.error.bind(console))
    .pipe(source(config.tsify.outFile))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write(config.paths.sourceMap))
    .pipe(gulp.dest(config.paths.dist));
});

// rebuild typescript to js and reload browsersync
gulp.task('babelify-watch', ['babelify'], function(done) {
    browserSync.reload();
    done();
});

// run browsersync server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: `./${config.paths.dist}/`
        }
    });
});



// build task
gulp.task("build", function (cb) {
    runSequence('clean', ['copy-html', 'babelify'], cb);
});



// run server
gulp.task('server', ['build'], function(done) {
    runSequence('browser-sync', done);
});

// run server and watch changes and reload
gulp.task('watch', ['server'], function() {
    gulp.watch(`${config.paths.source}/${config.paths.ts}/**/*.ts`, ['babelify-watch']);
    gulp.watch("*.html").on("change", browserSync.reload);
});


// default task -> build
gulp.task('default', ['build']);