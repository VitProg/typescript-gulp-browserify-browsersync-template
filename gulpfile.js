let argv = require('yargs').argv;
let gulp = require("gulp");
let gutil = require('gulp-util');
let runSequence = require('run-sequence');
let clean = require('gulp-clean');
let uglify = require('gulp-uglify');
let browserify = require("browserify");
let source = require('vinyl-source-stream');
let tsify = require("tsify");
let sourcemaps = require('gulp-sourcemaps');
let buffer = require('vinyl-buffer');
let browserSync = require('browser-sync').create();
// let tslint = require("gulp-tslint");
let KarmaServer = require('karma').Server;
let fs = require('fs');

/**********************/
let env = argv.env && (argv.env === 'prod' || argv.env === 'dev') ? argv.env : 'dev';
let isProd = env === 'prod';
let isDev = env === 'dev';
/**********************/


/*** CONFIG ***/
let config = {
    paths:      {
        dist:      'dist',
        temp:      'temp',
        sourceMap: './',
        source:    'source',
        ts:        'ts',
        tests:     'tests',
    },
    browserify: {
        entries: [
            'node_modules/babel-polyfill/dist/' + (isProd ? 'polyfill.min.js' : 'polyfill.js'),
            'source/ts/app.ts',
        ],
    },
    babelify:   {},
    tsify:      {
        outFile: 'bundle.js',
    },
    copyFiles:  [
        '*.html',
        'polyfills.js'
    ],
};
config.tests = {
    tsify: {
        outFile: 'bundle_test.js',
    },
    karma: {
        frameworks: ["jasmine"],
        files:      [
            config.paths.dist + '/polyfills.js',
            config.paths.dist + '/bundle_test.js',
        ],
        reporters:  ["verbose"],
        browsers:   ["Chrome"],
        singleRun:  true,
        autoWatch:  false,
    }
};
/********************/



// clean build directory
gulp.task("clean", function () {
    return gulp.src(['dist', 'temp'], {read: false}).pipe(clean());
});

// copy html files into build directory
gulp.task("copy-files", function () {
    return gulp.src(config.copyFiles.map((p) => `${config.paths.source}/${p}`))
               .pipe(gulp.dest(`${config.paths.dist}`));
});

// todo TSLint
// gulp.task("tslint", () =>
//     gulp.src("source.ts")
//         .pipe(tslint({
//                          formatter: "verbose"
//                      }))
//         .pipe(tslint.report())
// );

// build typescript to js
gulp.task('babelify', function () {
    let t = browserify(Object.assign(
        {
            basedir:      '.',
            debug:        isDev,
            cache:        {},
            packageCache: {}
        },
        config.browserify
    ));

    t = t.plugin(tsify, {
        target:                 "es2015",
        lib:                    ["es6", "dom"],
        types:                  ["reflect-metadata"],
        module:                 "commonjs",
        moduleResolution:       "node",
        experimentalDecorators: true,
        emitDecoratorMetadata:  true,
    });

    t = t.transform(
        'babelify',
        Object.assign(
            {
                presets: ['es2015'],
                // extensions: ['.ts'],
            },
            config.babelify
        ));

    t = t.bundle();

    if (isDev) {
        t = t.on('error', gutil.log.bind(gutil, 'Browserify Error'));
    }

    t = t.pipe(source(config.tsify.outFile));

    t = t.pipe(buffer());

    if (isDev) {
        t = t.pipe(sourcemaps.init({loadMaps: true}));
    }
    if (isProd) {
        t = t.pipe(uglify());
    }
    if (isDev) {
        t = t.pipe(sourcemaps.write(config.paths.sourceMap));
    }
    t = t.pipe(gulp.dest(config.paths.dist));
    return t;
});

// build typescript to js form tests
gulp.task('babelify-test', function () {
    let browserifyOptions = Object.assign(
        {
            basedir:      '.',
            debug:        isDev,
            cache:        {},
            packageCache: {}
        },
        config.browserify
    );

    let files = fs.readdirSync('./' + config.paths.tests + '/');

    if (files) {
        for (let i = 0; i < files.length; i++) {
            if (files.hasOwnProperty(i) === false) {
                continue;
            }
            if (files[i].endsWith('.spec.ts')) {
                browserifyOptions.entries.push(config.paths.tests + '/' + files[i]);
            }
        }

        // gutil.log(browserifyOptions);

        let t = browserify(browserifyOptions);

        t = t.plugin(tsify, {
            target:                 "es2015",
            lib:                    ["es6", "dom"],
            types:                  ["reflect-metadata"],
            module:                 "commonjs",
            moduleResolution:       "node",
            experimentalDecorators: true,
            emitDecoratorMetadata:  true,
        });

        t = t.transform('babelify', Object.assign({
                                                      presets: ['es2015'],
                                                      // extensions: ['.ts'],
                                                  }, config.babelify));

        t = t.bundle();

        if (isDev) {
            t = t.on('error', gutil.log.bind(gutil, 'Browserify Error'));
        }

        t = t.pipe(source(config.tests.tsify.outFile));

        t = t.pipe(buffer());

        if (isDev) {
            t = t.pipe(sourcemaps.init({loadMaps: true}));
        }
        if (isProd) {
            t = t.pipe(uglify());
        }
        if (isDev) {
            t = t.pipe(sourcemaps.write(config.paths.sourceMap));
        }
        t = t.pipe(gulp.dest(config.paths.dist));

        // gutil.log('ts fin');

        return t;
    }
    return null;
});

// rebuild typescript to js and reload browsersync
gulp.task('babelify-watch', ['babelify'], function (done) {
    browserSync.reload();
    done();
});

// run browsersync server
gulp.task('browser-sync', function () {
    browserSync.init(
        {
            server: {
                baseDir: `./${config.paths.dist}/`
            },
        });
});

gulp.task('browser-sync-reload', function (done) {
    browserSync.reload();
    setTimeout(() => {
        done();
    }, 500);
});


// build task
gulp.task("build", function (cb) {
    runSequence('clean', ['copy-files', 'babelify'], cb);
});

// build task
gulp.task("build-test", function (cb) {
    runSequence('clean', ['copy-files', 'babelify-test'], cb);
});


// run server
gulp.task('server', ['build'], function (done) {
    runSequence('browser-sync', done);
});

// run server and watch changes and reload
gulp.task('watch', ['server'], function () {
    gulp.watch(`${config.paths.source}/${config.paths.ts}/**/*.ts`, ['babelify-watch']);
    gulp.watch(`${config.paths.source}/*.html`).on("change", function () {
        runSequence('copy-files', ['browser-sync-reload'])
    });
});


// default task -> build
gulp.task('default', ['build']);


// Run test once and exit
gulp.task('test', ['build-test'], function (done) {
    let karma = new KarmaServer(
        config.tests.karma,
        function () {
            // provide an empty callback function so process.exit
            // is not called by karma
        });
    karma.on('run_complete', function (browsers, results) {
        done(results.error ? 'There are test failures' : null);
    });
    karma.start();
});