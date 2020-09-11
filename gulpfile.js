const minify = require("gulp-minify");
const { src, dest, series } = require("gulp");
const clean = require("gulp-clean");
const replace = require("gulp-replace");
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const through = require('through2')
const concat = require('gulp-concat');

const { StringDecoder } = require('string_decoder');

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
  return src([paths.js.dev + "/game_maps.js",paths.js.dev + "/game_main.js", paths.js.dev + "/!(game_maps, game_main)*.js"])
  .pipe(concat('index.js'))
  .pipe(through.obj((file, enc, cb) => {
   const content = file.contents.toString().split("\r\n").map (c => c.replace(/\n/, "").replace(/\r/, "").replace(/^export (default)?\s?/g, "").replace(/^import .*/g, ""))
    file.contents =  Buffer.from(content.join("\n"), 'utf8')
  cb(null,file );      
  }))   
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
