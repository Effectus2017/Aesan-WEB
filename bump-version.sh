#!/bin/bash

# Verificar si estamos en develop
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "❌ Este script solo debe ejecutarse en el branch develop"
    exit 1
fi

# Obtener la última versión
LAST_VERSION=$(git describe --tags --abbrev=0)

# Separar en partes MAJOR.MINOR.PATCH
IFS='.' read -r MAJOR MINOR PATCH <<< "${LAST_VERSION//v/}"

# Incrementar PATCH
PATCH=$((PATCH + 1))

# Nueva versión
NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

# Verificar si el tag ya existe
if git rev-parse "$NEW_VERSION" >/dev/null 2>&1; then
    echo "⚠️ El tag $NEW_VERSION ya existe"
    exit 0
fi

# Crear el nuevo tag
git tag -a $NEW_VERSION -m "Nueva versión $NEW_VERSION"
git push origin --tags

echo "✅ Nueva versión: $NEW_VERSION"
