# Playwright Tests

Este directorio contiene los tests end-to-end usando Playwright para la aplicación Angular.

## Configuración

### Instalación
```bash
npm install -D @playwright/test
npx playwright install
```

### Scripts disponibles
- `npm run test:e2e` - Ejecutar todos los tests
- `npm run test:e2e:ui` - Ejecutar tests con interfaz gráfica
- `npm run test:e2e:headed` - Ejecutar tests con navegador visible
- `npm run test:e2e:debug` - Ejecutar tests en modo debug
- `npm run test:e2e:report` - Mostrar reporte de tests

## Estructura de archivos

```
tests/
├── README.md                 # Esta documentación
├── utils/
│   └── test-helpers.ts      # Utilidades para tests
├── schools-add.spec.ts      # Tests para agregar escuelas
├── login.spec.ts            # Tests completos de login
├── login-simple.spec.ts     # Tests simplificados de login
└── screenshots/             # Screenshots de tests fallidos
```

## Escribiendo tests

### Ejemplo básico
```typescript
import { test, expect } from '@playwright/test';

test('should display login form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('form')).toBeVisible();
});
```

### Usando utilidades
```typescript
import { TestHelpers } from './utils/test-helpers';

test('should fill form correctly', async ({ page }) => {
  await TestHelpers.fillFormField(page, '[formControlName="name"]', 'Test School');
  await TestHelpers.selectDropdownOption(page, '[formControlName="city"]');
});

// Login específico para NUTRE
test('should login successfully', async ({ page }) => {
  await TestHelpers.loginNutre(page);
  await expect(page).toHaveURL(/.*admin-portal.*/);
});
```

## Selectores recomendados

### Para formularios Angular Material
- `[formControlName="fieldName"]` - Campos de formulario
- `.mat-error` - Mensajes de error
- `.mat-option` - Opciones de dropdown
- `button[type="submit"]` - Botón de envío

### Para navegación
- `a[routerLink="/path"]` - Enlaces de navegación
- `button:has-text("Text")` - Botones por texto

## Debugging

### Modo debug
```bash
npm run test:e2e:debug
```

### Screenshots automáticos
Los screenshots se toman automáticamente en tests fallidos y se guardan en `tests/screenshots/`.

### Traces
Los traces se generan automáticamente y se pueden ver con:
```bash
npx playwright show-trace trace.zip
```

## Mejores prácticas

1. **Usar selectores específicos**: Evitar selectores genéricos como `div` o `button`
2. **Esperar elementos**: Usar `waitFor` en lugar de `expect` para elementos que pueden tardar en cargar
3. **Organizar tests**: Agrupar tests relacionados en `test.describe()`
4. **Reutilizar código**: Usar las utilidades en `test-helpers.ts`
5. **Limpiar datos**: Usar `test.beforeEach()` y `test.afterEach()` para setup/cleanup

## Configuración

La configuración principal está en `playwright.config.ts` en la raíz del proyecto.

### Navegadores soportados
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

### Configuración de servidor
El servidor de desarrollo se inicia automáticamente antes de ejecutar los tests.

## Troubleshooting

### Error de dependencias
Si hay conflictos de dependencias, usar:
```bash
npm install --legacy-peer-deps
```

### Tests que fallan intermitentemente
- Agregar `await page.waitForLoadState('networkidle')`
- Usar `await expect().toBeVisible()` en lugar de `await page.click()`
- Verificar que los elementos estén realmente visibles antes de interactuar

### Problemas de autenticación
Ajustar la función `login()` en `test-helpers.ts` según tu implementación de autenticación. 
