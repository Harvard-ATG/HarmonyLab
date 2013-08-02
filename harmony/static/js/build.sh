#!/usr/bin/sh

# Note: must have node.js installed
# To install the optimizer "r.js": npm -g install requirejs
# Pass flag "optimize=none" to disable minification/uglification

VERSION=$(git rev-parse HEAD)

mkdir -v build
r.js -o build.js optimize=none 
echo $VERSION > build/version
