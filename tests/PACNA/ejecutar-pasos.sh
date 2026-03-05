#!/bin/bash

# --- GUÍA DE EJECUCIÓN PASO A PASO PARA PACNA ---
# Este archivo contiene los comandos corregidos para ejecutar el flujo completo.
# Se incluye la bandera --headed para que puedas ver el navegador en acción.

echo "Selecciona el paso que deseas ejecutar:"
echo "1) Registro de Agencia (01-Registro-PACNA)"
echo "2) Login y Cambio de Contraseña (02-Login-PACNA)"
echo "3) Registro de Escuelas (03-Registro-Escuela-PACNA)"
echo "q) Salir"

read -p "Opción: " opcion

case $opcion in
  1)
    echo "Ejecutando Registro de Agencia..."
    npx playwright test tests/PACNA/01-Registro-PACNA.spec.ts --project=chromium-unauthenticated --headed
    ;;
  2)
    echo "Ejecutando Login y Cambio de Contraseña..."
    npx playwright test tests/PACNA/02-Login-PACNA.spec.ts --project=chromium-unauthenticated --headed
    ;;
  3)
    echo "Ejecutando Registro de Escuelas..."
    npx playwright test tests/PACNA/03-Registro-Escuela-PACNA.spec.ts --project=chromium-unauthenticated --headed
    ;;
  q)
    exit 0
    ;;
  *)
    echo "Opción no válida."
    ;;
esac
