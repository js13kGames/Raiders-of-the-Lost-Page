const minify = require("gulp-minify");
const { src, dest, series } = require("gulp");
const clean = require("gulp-clean");
const replace = require("gulp-replace");
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');

const sass = require("gulp-sass");
sass.compiler = require("node-sass");

const fs = require("fs");
const paths = {
  build: "./dist",
  src: "./src",
  js: { dev: "./src/js", build: "./dist/js" },
  styles: { dev: "./src/styles", build: "./dist/styles" },
};

function cleanDist() {
  return src(paths.build + "/*").pipe(clean());
}

function compileSass() {
  return src([`${paths.styles.dev}/*.scss`])
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(cleanCSS())
    .pipe(dest(paths.styles.build));
}

function compress() {
  return src([paths.js.dev + "/*.js"])
    .pipe(
      minify({
        ext: {
          min: ".js",
        },
        noSource: true,
      })
    )
    .pipe(dest(paths.js.build));
}
function copyIndex() {
  return src(paths.src + "/index.html")
    .pipe(replace(/\.scss/g, ".css"))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(paths.build));
}

exports.compress = compress;
exports.clean = cleanDist;
exports.copy = copyIndex;
exports.build = series(cleanDist, compress, compileSass, copyIndex);
