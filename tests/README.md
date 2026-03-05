# Playwright Tests con MCP (Model Context Protocol)

Este directorio contiene los tests end-to-end usando Playwright para la aplicación Angular, configurado con soporte para MCP para aprovechar el árbol de accesibilidad y mejorar la robustez de los tests.

## 🚀 Características

- **Estado de autenticación persistente**: Evita re-login en cada test
- **Árbol de accesibilidad**: Usa el árbol de accesibilidad de Playwright para encontrar elementos de forma más robusta
- **Helpers mejorados**: Utilidades que aprovechan MCP para tests más estables
- **Proyectos separados**: Tests autenticados y no autenticados en proyectos diferentes

## Configuración

### Instalación
```bash
npm install -D @playwright/test
npx playwright install
```

### Instalación de Playwright MCP (Opcional)
Para usar las capacidades completas de MCP:
```bash
npx @playwright/mcp@latest
```

### Scripts disponibles
- `npm run test:e2e` - Ejecutar todos los tests
- `npm run test:e2e:ui` - Ejecutar tests con interfaz gráfica
- `npm run test:e2e:headed` - Ejecutar tests con navegador visible
- `npm run test:e2e:debug` - Ejecutar tests en modo debug
- `npm run test:e2e:report` - Mostrar reporte de tests
- `npm run test:e2e:login` - Ejecutar solo tests de login
- `npm run test:e2e:schools` - Ejecutar solo tests de escuelas

## Estructura de archivos

```
tests/
├── README.md                      # Esta documentación
├── auth.setup.ts                   # Setup global de autenticación
├── .auth/                          # Estado de autenticación (gitignored)
│   └── user.json                   # Estado guardado de la sesión
├── PACNA/                         # Pruebas del programa PACNA
├── PDAM/                          # Pruebas del programa PDAM
├── PSAV/                          # Pruebas del programa PSAV
├── utils/
│   ├── test-helpers.ts            # Utilidades principales para tests
│   ├── auth-helper.ts             # Helper para gestión de autenticación
│   └── accessibility-helper.ts    # Helper para árbol de accesibilidad (MCP)
└── screenshots/                    # Screenshots de tests fallidos
```

## Escribiendo tests

### Tests con autenticación automática

Los tests que requieren autenticación deben usar el proyecto `chromium-authenticated` (o `firefox-authenticated`, `webkit-authenticated`):

```typescript
import { test, expect } from '@playwright/test';

// Este test usará automáticamente el estado de autenticación guardado
test.use({ project: 'chromium-authenticated' });

test('should access protected page', async ({ page }) => {
  // Ya estás autenticado, no necesitas hacer login
  await page.goto('/agency-portal/schools');
  await expect(page).toHaveURL(/.*schools.*/);
});
```

### Tests sin autenticación

Para tests que no requieren login, usa los proyectos `-unauthenticated`:

```typescript
import { test, expect } from '@playwright/test';

test.use({ project: 'chromium-unauthenticated' });

test('should display login form', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cy=email-field]')).toBeVisible();
});
```

### Ejemplo básico con utilidades mejoradas

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { AccessibilityHelper } from './utils/accessibility-helper';

test('should fill form correctly', async ({ page }) => {
  // Usando selector tradicional
  await TestHelpers.fillFormField(page, '[formControlName="name"]', 'Test School');
  
  // O mejor: usando el árbol de accesibilidad
  await TestHelpers.fillFieldByLabel(page, 'Nombre de la escuela', 'Test School');
  
  // Botones usando árbol de accesibilidad
  await TestHelpers.clickButton(page, 'Guardar');
});
```

### Usando el árbol de accesibilidad (MCP)

```typescript
import { test, expect } from '@playwright/test';
import { AccessibilityHelper } from './utils/accessibility-helper';

test('should interact using accessibility tree', async ({ page }) => {
  // Encontrar elementos por su rol y nombre accesible
  const submitButton = AccessibilityHelper.getButton(page, 'Enviar');
  const emailField = AccessibilityHelper.getTextField(page, 'Email');
  const loginLink = AccessibilityHelper.getLink(page, 'Iniciar sesión');
  
  // Interactuar con los elementos
  await emailField.fill('test@example.com');
  await submitButton.click();
});
```

### Login manual (si es necesario)

```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { AuthHelper } from './utils/auth-helper';

test('should login and save state', async ({ page }) => {
  // Login y guardar estado
  await AuthHelper.loginAndSaveState(page, 'user@example.com', 'password');
  
  // Verificar autenticación
  const isAuthenticated = await AuthHelper.isAuthenticated(page);
  expect(isAuthenticated).toBe(true);
});
```

## Selectores recomendados

### Prioridad: Usar árbol de accesibilidad (MCP)

**Recomendado (más robusto):**
```typescript
// Por rol y nombre accesible
page.getByRole('button', { name: 'Guardar' })
page.getByRole('textbox', { name: 'Email' })
page.getByLabel('Nombre de la escuela')
page.getByPlaceholder('Ingrese su email')
```

**Fallback: Selectores tradicionales**
```typescript
// Solo si no hay alternativa accesible
page.locator('[data-cy=email-input]')
page.locator('[formControlName="name"]')
```

### Para formularios Angular Material
- `page.getByLabel('Field Label')` - Campos por etiqueta (recomendado)
- `page.getByRole('textbox', { name: 'Field Name' })` - Campos de texto
- `page.getByRole('combobox', { name: 'Select Name' })` - Dropdowns
- `page.getByRole('button', { name: 'Button Text' })` - Botones
- `[formControlName="fieldName"]` - Fallback para campos sin etiqueta accesible
- `.mat-error` - Mensajes de error
- `.mat-option` - Opciones de dropdown

### Para navegación
- `page.getByRole('link', { name: 'Link Text' })` - Enlaces (recomendado)
- `a[routerLink="/path"]` - Enlaces de navegación (fallback)
- `page.getByRole('button', { name: 'Button Text' })` - Botones (recomendado)

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

### Proyectos disponibles

El proyecto está configurado con múltiples proyectos para diferentes escenarios:

- **`setup`**: Ejecuta el login inicial y guarda el estado de autenticación
- **`chromium-authenticated`**: Tests en Chromium con autenticación automática
- **`chromium-unauthenticated`**: Tests en Chromium sin autenticación
- **`firefox-authenticated`**: Tests en Firefox con autenticación automática
- **`firefox-unauthenticated`**: Tests en Firefox sin autenticación
- **`webkit-authenticated`**: Tests en WebKit con autenticación automática
- **`webkit-unauthenticated`**: Tests en WebKit sin autenticación

### Estado de autenticación

El estado de autenticación se guarda automáticamente en `tests/.auth/user.json` después del primer login. Este archivo:
- Se regenera automáticamente si expira
- Se reutiliza en tests posteriores para evitar re-login
- Está en `.gitignore` por seguridad

### Navegadores soportados
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

### Configuración de servidor
El servidor de desarrollo se inicia automáticamente antes de ejecutar los tests (comentado por defecto).

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

**El estado de autenticación expiró:**
```bash
# Eliminar el estado guardado para forzar nuevo login
rm tests/.auth/user.json
```

**Forzar nuevo login:**
```typescript
import { AuthHelper } from './utils/auth-helper';

// En tu test
AuthHelper.clearStoredAuthState();
await AuthHelper.loginAndSaveState(page);
```

### Ventajas de usar MCP y árbol de accesibilidad

1. **Más robusto**: Los selectores basados en accesibilidad son menos propensos a romperse con cambios de UI
2. **Mejor para accesibilidad**: Fuerza a que la aplicación sea accesible
3. **Más legible**: `getByRole('button', { name: 'Guardar' })` es más claro que `locator('.btn-save')`
4. **Determinista**: Evita ambigüedades comunes en enfoques basados en capturas de pantalla

### Recursos adicionales

- [Documentación de Playwright](https://playwright.dev/docs/intro)
- [Playwright MCP en GitHub](https://github.com/microsoft/playwright-mcp)
- [Árbol de accesibilidad de Playwright](https://playwright.dev/docs/accessibility-testing) 
