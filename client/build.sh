#!/bin/bash

# Create the webapp output directory if it does not exist
mkdir -p dist/lib

# Build the webapp
node ./build.js

# Package assets for the web
grunt package

# Copy assets
echo "Copying index.html entrypoint..."
cp static/index.html dist/index.html

echo "Copying bootstrap CSS..."
cp node_modules/bootstrap/dist/css/bootstrap.css dist/lib/bootstrap.css

echo "Copying jQuery UI images..."
mkdir -p dist/images
cp node_modules/jquery-ui/dist/themes/ui-lightness/images/* dist/images

echo "Copying bootstrap fonts"
mkdir -p dist/fonts
cp node_modules/bootstrap/dist/fonts/* dist/fonts