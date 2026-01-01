# Configuración de Playwright con MCP - Resumen

## ✅ Configuración Completada

Se ha configurado Playwright con soporte completo para MCP (Model Context Protocol) y estado de autenticación persistente.

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

1. **`tests/utils/auth-helper.ts`**
   - Helper para gestión de autenticación
   - Guarda y carga estado de sesión
   - Verifica validez del estado guardado

2. **`tests/utils/accessibility-helper.ts`**
   - Helper para usar el árbol de accesibilidad
   - Métodos para encontrar elementos por rol, etiqueta, placeholder, etc.
   - Funciones para verificar accesibilidad por teclado

3. **`tests/auth.setup.ts`**
   - Setup global que ejecuta login antes de tests autenticados
   - Guarda el estado de autenticación automáticamente
   - Verifica y renueva el estado si expira

4. **`tests/example-mcp-usage.spec.ts`**
   - Ejemplos de uso de todas las nuevas funcionalidades
   - Tests de referencia para diferentes escenarios

5. **`tests/.auth/.gitkeep`**
   - Directorio para almacenar estado de autenticación

6. **`tests/.gitignore`**
   - Ignora archivos sensibles de autenticación

### Archivos Modificados

1. **`playwright.config.ts`**
   - ✅ Configurado con múltiples proyectos (autenticados/no autenticados)
   - ✅ Setup automático de autenticación
   - ✅ Configuración optimizada para MCP
   - ✅ Timeouts y configuraciones mejoradas

2. **`tests/utils/test-helpers.ts`**
   - ✅ Métodos mejorados que usan árbol de accesibilidad
   - ✅ Fallback a selectores tradicionales
   - ✅ Integración con AuthHelper

3. **`tests/README.md`**
   - ✅ Documentación completa de MCP
   - ✅ Ejemplos de uso
   - ✅ Guía de mejores prácticas

4. **`.gitignore`**
   - ✅ Agregado directorio `.auth/` y `screenshots/`

## 🚀 Cómo Usar

### 1. Ejecutar Setup de Autenticación

El setup se ejecuta automáticamente cuando corres tests que requieren autenticación:

```bash
npm run test:e2e
```

### 2. Tests con Autenticación Automática

```typescript
test.use({ project: 'chromium-authenticated' });

test('mi test autenticado', async ({ page }) => {
  // Ya estás autenticado, no necesitas hacer login
  await page.goto('/agency-portal/schools');
});
```

### 3. Tests sin Autenticación

```typescript
test.use({ project: 'chromium-unauthenticated' });

test('mi test sin login', async ({ page }) => {
  await page.goto('/');
  // Verificar formulario de login
});
```

### 4. Usar Árbol de Accesibilidad

```typescript
import { AccessibilityHelper } from './utils/accessibility-helper';

// Encontrar botón por su texto accesible
const button = AccessibilityHelper.getButton(page, 'Guardar');
await button.click();

// Encontrar campo por su etiqueta
const field = AccessibilityHelper.getByLabel(page, 'Email');
await field.fill('test@example.com');
```

## 📊 Proyectos Disponibles

- `setup` - Ejecuta login y guarda estado
- `chromium-authenticated` - Chromium con auth
- `chromium-unauthenticated` - Chromium sin auth
- `firefox-authenticated` - Firefox con auth
- `firefox-unauthenticated` - Firefox sin auth
- `webkit-authenticated` - WebKit con auth
- `webkit-unauthenticated` - WebKit sin auth

## 🔧 Comandos Útiles

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar con UI
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug

# Ver reporte
npm run test:e2e:report

# Limpiar estado de autenticación (forzar nuevo login)
rm tests/.auth/user.json
```

## 🎯 Ventajas de esta Configuración

1. **Autenticación Persistente**: No necesitas hacer login en cada test
2. **Más Robusto**: Usa árbol de accesibilidad en lugar de selectores CSS frágiles
3. **Mejor para Accesibilidad**: Fuerza que la app sea accesible
4. **Más Rápido**: Reutiliza sesiones de autenticación
5. **Determinista**: Evita ambigüedades de capturas de pantalla

## 📝 Próximos Pasos

1. Actualizar tests existentes para usar los nuevos helpers
2. Migrar tests de TestSprite (Python) a TypeScript/Playwright
3. Agregar más tests usando el árbol de accesibilidad
4. Configurar CI/CD para usar esta configuración

## 🔍 Verificación

Para verificar que todo funciona:

```bash
# Ejecutar el ejemplo
npx playwright test example-mcp-usage

# Verificar que el estado se guardó
ls -la tests/.auth/
```

## 📚 Recursos

- [Documentación Playwright](https://playwright.dev)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Árbol de Accesibilidad](https://playwright.dev/docs/accessibility-testing)

