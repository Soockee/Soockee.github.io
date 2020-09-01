var gulp = require("gulp");
var browserSync = require("browser-sync");
var sass = require("gulp-sass");
var cssnano = require("gulp-cssnano");
var prefix = require("gulp-autoprefixer");
var uglify = require("gulp-uglify");
const spawn = require('cross-spawn');
/**
 * Compile and minify sass
 */
function styles() {
  return gulp
    .src(["_sass/*.scss"])
    .pipe(
      sass({
        includePaths: ["scss"],
        onError: browserSync.notify,
      })
    )
    .pipe(prefix(["last 3 versions", "> 1%", "ie 8"], { cascade: true }))
    .pipe(gulp.dest("_site/assets/css/"))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest("assets/css"));
}

function stylesProd() {
  return gulp
    .src(["_sass/*.scss"])
    .pipe(
      sass({
        includePaths: ["scss"],
        onError: browserSync.notify,
      })
    )
    .pipe(prefix(["last 3 versions", "> 1%", "ie 8"], { cascade: true }))
    .pipe(cssnano())
    .pipe(gulp.dest("_site/assets/css/"))
    .pipe(gulp.dest("assets/css"));
}

/**
 * Compile and minify js
 */
function scripts() {
  return gulp
    .src(["_js/*.js"])
    .pipe(gulp.dest("_site/assets/js"))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(gulp.dest("assets/js"));
}

function scriptsProd() {
  return gulp
    .src(["_js/*.js"])
    .pipe(uglify())
    .pipe(gulp.dest("_site/assets/js"))
    .pipe(gulp.dest("assets/js"));
}

/**
 * Server functionality handled by BrowserSync
 */
function browserSyncServe(done) {
  browserSync.init({
    server: "_site",
    port: 4000,
  });
  done();
}

function browserSyncReload(done) {
  browserSync.reload();
  done();
}

/**
 * Build Jekyll site
 */
function jekyllDev(done) {
  return spawn(
      "bundle",
      ["exec", "jekyll", "build", "--incremental", "--config=_config.yml"],
      {
        stdio: "inherit",
      }
    )
    .on("close", done);
}

function jekyllProd(done) {
  return spawn("bundle", ["exec", "jekyll", "build"], { stdio: "inherit" })
    .on("close", done);
}

/**
 * Watch source files for changes & recompile
 * Watch html/md files, run Jekyll & reload BrowserSync
 */
function watchData() {
  gulp.watch(
    ["_data/*.yml", "_config.yml"],
    gulp.series(jekyllDev, browserSyncReload)
  );
}

function watchMarkup() {
  gulp.watch(
    [
      "index.html",
      "_includes/*.html",
      "_layouts/*.html",
      "index.md",
      "_posts/*.md",
    ],
    gulp.series(jekyllDev, browserSyncReload)
  );
}

function watchScripts() {
  gulp.watch(["_js/*.js"], scripts);
}

function watchStyles() {
  gulp.watch(["_sass/*.scss"], styles);
}

function watch() {
  gulp.parallel(watchData, watchMarkup, watchScripts, watchStyles);
}

var compile = gulp.parallel(styles, scripts);
var compileProd = gulp.parallel(stylesProd, scriptsProd);
var serve = gulp.series(compile, jekyllDev, browserSyncServe);
var watch = gulp.parallel(watchData, watchMarkup, watchScripts, watchStyles);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the Jekyll site, launch BrowserSync & watch files.
 */
gulp.task("default", gulp.parallel(serve, watch));
gulp.task("build", gulp.series(compileProd, jekyllProd));
