#!/bin/bash
set -e
cd "$(dirname "$0")"

rm -rf dist
mkdir dist

cp index.html dist/
cp -R assets dist/

echo "Build complete: dist/"
echo "dist/ is a plain static site - point nginx's document root at it."
