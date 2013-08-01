#!/usr/bin/sh

# Note: must have node.js installed
# To install the optimizer "r.js": npm -g install requirejs

mkdir -v build
r.js -o build.js optimize=none # remove optimize=none to minify
