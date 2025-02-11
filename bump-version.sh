#!/bin/bash

# Obtener la última versión
LAST_VERSION=$(git describe --tags --abbrev=0)

# Separar en partes MAJOR.MINOR.PATCH
IFS='.' read -r MAJOR MINOR PATCH <<< "${LAST_VERSION//v/}"

# Incrementar PATCH
PATCH=$((PATCH + 1))

# Nueva versión
NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

# Crear el nuevo tag
git tag -a $NEW_VERSION -m "Nueva versión $NEW_VERSION"
git push origin --tags

echo "✅ Nueva versión: $NEW_VERSION"