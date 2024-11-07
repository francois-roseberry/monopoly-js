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