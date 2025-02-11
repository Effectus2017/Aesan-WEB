#!/bin/bash

# Obtener la última versión de Git (sin la "v" al inicio)
VERSION=$(git describe --tags --abbrev=0 | sed 's/^v//')

# Reemplazar la versión en package.json
jq --arg ver "$VERSION" '.version = $ver' package.json > package.tmp.json && mv package.tmp.json package.json

echo "✅ Versión actualizada en package.json: $VERSION"
