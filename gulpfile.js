// Warning : must be updated to conform to project
// https://github.com/greypants/gulp-starter
// separate tasks and config

// @todo : refactor watcher

// Option : add casperJs test with gulp
// http://macr.ae/article/gulp-casperjs.html

// Option : add Livereload ???


/* ========================================================================== */
/* PROJECT CONFIG                                                             */
/* ========================================================================== */

// Requirements
var gulp       = require('gulp'),
    util       = require('gulp-util'),
    exec       = require('child_process').exec,
    less       = require('gulp-less'),
    watch      = require('gulp-watch'),
    uglify     = require('gulp-uglify'),
    jshint     = require('gulp-jshint'),
    csslint    = require('gulp-csslint'),
    concat     = require('gulp-concat'),
    rename     = require('gulp-rename'),
    imagemin   = require('gulp-imagemin'),
    pngquant   = require('imagemin-pngquant'),
    header     = require('gulp-header'),
    minify     = require('gulp-minify-css'),
    // sourcemaps = require('gulp-sourcemaps'),
    notify     = require('gulp-notify')
    plumber    = require('gulp-plumber'),
    changed    = require('gulp-changed'),
    //gzip       = require('gulp-gzip'),
    livereload = require('gulp-livereload');

// gzip_options
/*var gzip_options = {
  threshold: '1kb',
  gzipOptions: {
    level: 9
  }
};
*/
livereload({ start: true })

// Define paths
var basePaths = {
  src: 'src/',
  dest: ''
};

var paths = {
  less: {
    srcFile: basePaths.src + 'less/app-front.less',
    srcDir: basePaths.src + 'less/**/*.less'
  },
  css: {
    destFile: basePaths.dest + 'css/'
  },
  js: {
    srcDir: basePaths.src + 'js/*.js',
    destDir: basePaths.dest + 'js/',
    destFile: {
      main: basePaths.dest + 'js/main.min.js'
    }
  },
  bootscript: {
    srcDir: basePaths.src + 'js/bootstrap/',
    destDir: basePaths.dest + 'js/',
    destFile: {
      main: basePaths.dest + 'js/bootstrap.min.js'
    }
  },
  img: {
    srcDir: basePaths.src + 'img/**/*',
    destDir: basePaths.dest + 'images/'
  },
};

// Load the package.json and prepare banner
var pkg = require('./package.json');
var year = new Date().getFullYear();
var banner = ['/**',
  ' * <%= pkg.owner %>',
  ' *',
  ' * @link    <%= pkg.homepage %>',
  ' * @version v<%= pkg.version %> (<%= year %>)',
  ' * @author  <%= pkg.author.name %> => <%= pkg.author.home %> && <%= pkg.author.twitter %>',
  ' *',
  ' * Copyright (c) <%= year %> ' + '<%= pkg.owner %>',
  ' */',
  ''].join('\n');


/* ========================================================================== */
/* DEFAULT TASK                                                               */
/* ========================================================================== */

// Task Default => gulp
gulp.task('default', function () {
  gulp.start('style');
  gulp.start('script');
  gulp.start('bootstrap');
  gulp.start('imagemin');
  gulp.start('watcher');
});


/* ========================================================================== */
/* GENERAL TASKS                                                              */
/* ========================================================================== */

// Task Less => gulp style
gulp.task('style', function () {
  gulp.src(paths.less.srcFile)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(less())
    .pipe(minify())
    .pipe(header(banner, { pkg:pkg, year:year } ))
    .pipe(rename('app-front.min.css'))
    //.pipe(gzip(gzip_options))
    .pipe(gulp.dest(paths.css.destFile))
    .pipe(livereload());
});

// Task Uglify => gulp script
gulp.task('script', function () {
  gulp.src(paths.js.srcDir)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(changed(paths.js.destDir))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.js.destDir));

  gulp.start('script-banner');
});

// Task Uglify => gulp bootstrap
gulp.task('bootstrap', function () {
  gulp.src([
          paths.bootscript.srcDir + 'transition.js',
          paths.bootscript.srcDir + 'alert.js',
          paths.bootscript.srcDir + 'button.js',
          paths.bootscript.srcDir + 'carousel.js',
          paths.bootscript.srcDir + 'collapse.js',
          paths.bootscript.srcDir + 'dropdown.js',
          paths.bootscript.srcDir + 'modal.js',
          paths.bootscript.srcDir + 'tooltip.js',
          paths.bootscript.srcDir + 'popover.js',
          paths.bootscript.srcDir + 'scrollspy.js',
          paths.bootscript.srcDir + 'tab.js',
          paths.bootscript.srcDir + 'affix.js'
        ])
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(changed(paths.js.destDir))
    .pipe(concat('bootstrap.js'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.js.destDir));
});

// Task Uglify => gulp stuffimg
gulp.task('imagemin', function () {
  gulp.src(paths.img.srcDir)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(changed(paths.img.destDir))
    .pipe(imagemin({
        optimizationLevel: 7,
        progressive: true,
        interlaced: true
    }))
    .pipe(gulp.dest(paths.img.destDir));
});

// Task Banner => gulp script-banner
gulp.task('script-banner', function() {
  gulp.src([paths.js.destFile.main])
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(header(banner, { pkg:pkg, year:year } ))
    .pipe(gulp.dest(paths.js.destDir));

  // gulp.src(paths.js.destFile.glossary)
  //   .pipe(header(banner, { pkg:pkg, year:year } ))
  //   .pipe(gulp.dest(paths.js.destDir));
});


/* ========================================================================== */
/* WATCHER TASK                                                               */
/* ========================================================================== */

gulp.task('watcher', function() {
  livereload.listen();

  var watcherScript = gulp.watch(paths.js.srcDir, ['script']);
  watcherScript.on('change', function (event) {
    console.log('Event type: ' + event.type);
    console.log('Event path: ' + event.path);
  });

  var watcherBootstrap = gulp.watch(paths.bootscript.srcDir, ['bootstrap']);
  watcherBootstrap.on('change', function (event) {
    console.log('Event type: ' + event.type);
    console.log('Event path: ' + event.path);
  });

  var watcherImg = gulp.watch(paths.img.srcDir, ['imagemin']);
  watcherImg.on('change', function (event) {
    console.log('Event type: ' + event.type);
    console.log('Event path: ' + event.path);
  });

  var watcherStyle = gulp.watch(paths.less.srcDir, ['style']);
  watcherStyle.on('change', function (event) {
    console.log('Event type: ' + event.type);
    console.log('Event path: ' + event.path);
  });
});


/* ========================================================================== */
/* TEST TASKS                                                                 */
/* ========================================================================== */

// Task Jshint => gulp js-lint
gulp.task('js-lint', function () {
  gulp.src(paths.js.srcDir)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(jshint())
    .pipe(jshint.reporter());
});

// Task csslint => gulp css-lint
gulp.task('css-lint', function() {
  gulp.src(paths.css.destFile)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(csslint())
    .pipe(csslint.reporter());
});

// Task Dev => gulp test
gulp.task('test', function () {
  gulp.start('js-lint');
  gulp.start('css-lint');
});
