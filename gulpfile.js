const { src, dest, watch, series, parallel } = require('gulp');
const dartSass = require('sass');
const gulpSass = require('gulp-sass');
const sassCompiler = gulpSass.default || gulpSass;
const sass = sassCompiler(dartSass);
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const terser = require('gulp-terser');
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');

const paths = {
  html: {
    src: 'src/index.html',
    dest: 'dist'
  },
  styles: {
    src: 'src/scss/main.scss',
    dest: 'dist/css'
  },
  scripts: {
    src: 'src/js/main.js',
    dest: 'dist/js'
  },
  assets: {
    src: 'src/assets/**/*',
    dest: 'dist/assets'
  }
};

function clean() {
  return deleteAsync(['dist/**', '!dist']);
}

function html() {
  return src(paths.html.src)
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

function styles() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass.sync({ includePaths: ['node_modules'] }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function scripts() {
  return browserify({ entries: [paths.scripts.src], debug: true })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

function assets() {
  return src(paths.assets.src)
    .pipe(dest(paths.assets.dest))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: { baseDir: 'dist' },
    https: true,
    open: false,
    notify: false
  });

  watch('src/scss/**/*.scss', styles);
  watch('src/js/**/*.js', scripts);
  watch('src/index.html', html);
  watch('src/assets/**/*', assets);
}

const build = series(clean, parallel(html, styles, scripts, assets));

exports.clean = clean;
exports.build = build;
exports.default = series(build, serve);
