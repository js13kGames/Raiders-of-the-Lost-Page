const express = require("express");
const app = express();
const port = 3000;
const compileSass = require("express-compile-sass");

let env = "dev";
process.argv.forEach(function (val, index) {
  if (val === "-p") {
    env = "prod";
  }
});

const root = env === "dev" ? "src" : "dist";

app.use(
  compileSass({
    root: root,
    sourceMap: true, // Includes Base64 encoded source maps in output css
    sourceComments: true, // Includes source comments in output css
    watchFiles: true, // Watches sass files and updates mtime on main files for each change
    logToConsole: false, // If true, will log to console.error on errors
  })
);

app.use(express.static(root));

app.listen(port, () => console.log(`Application env ${env.toUpperCase()} listening at http://localhost:${port}`));

// print process.argv
