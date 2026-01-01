import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { AccessibilityHelper } from './utils/accessibility-helper';

/**
 * Ejemplos de uso de Playwright con MCP
 * 
 * Este archivo muestra cómo usar las nuevas funcionalidades:
 * - Estado de autenticación persistente
 * - Árbol de accesibilidad
 * - Helpers mejorados
 */

// Ejemplo 1: Test con autenticación automática
test.describe('Tests con autenticación automática', () => {
  // Usar proyecto con autenticación
  test.use({ project: 'chromium-authenticated' });

  test('debería acceder a página protegida sin hacer login', async ({ page }) => {
    // Ya estás autenticado automáticamente gracias al setup
    await page.goto('/agency-portal/schools');
    await expect(page).toHaveURL(/.*schools.*/);
    
    // Verificar que la página se cargó correctamente
    await TestHelpers.waitForPageLoad(page);
  });

  test('debería crear una escuela usando el árbol de accesibilidad', async ({ page }) => {
    await page.goto('/agency-portal/schools');
    await TestHelpers.waitForPageLoad(page);

    // Buscar botón usando el árbol de accesibilidad
    const addButton = AccessibilityHelper.getButton(page, /agregar|add/i);
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Esperar a que el modal se abra
    const modal = page.locator('mat-dialog-container, [role="dialog"]');
    await expect(modal).toBeVisible();

    // Llenar campo usando etiqueta accesible
    await TestHelpers.fillFieldByLabel(page, /nombre|name/i, 'Escuela Test MCP');

    // Guardar usando botón accesible
    const saveButton = AccessibilityHelper.getButton(page, /guardar|save|agregar|add/i);
    await saveButton.click();

    // Verificar éxito
    await expect(modal).not.toBeVisible({ timeout: 10000 });
  });
});

// Ejemplo 2: Test sin autenticación
test.describe('Tests sin autenticación', () => {
  test.use({ project: 'chromium-unauthenticated' });

  test('debería mostrar el formulario de login', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que el formulario de login está visible
    const emailField = AccessibilityHelper.getTextField(page, /email|correo/i)
      .or(page.locator('[data-cy=email-field]'));
    
    await expect(emailField).toBeVisible();
  });

  test('debería hacer login manualmente', async ({ page }) => {
    // Login manual usando helpers
    await TestHelpers.loginNutre(page);
    
    // Verificar que estamos autenticados
    await expect(page).not.toHaveURL(/.*login.*/);
  });
});

// Ejemplo 3: Uso avanzado del árbol de accesibilidad
test.describe('Uso avanzado del árbol de accesibilidad', () => {
  test.use({ project: 'chromium-authenticated' });

  test('debería interactuar con elementos usando roles', async ({ page }) => {
    await page.goto('/agency-portal/schools');
    await TestHelpers.waitForPageLoad(page);

    // Buscar elementos por su rol
    const headings = page.getByRole('heading');
    const buttons = page.getByRole('button');
    const links = page.getByRole('link');

    // Verificar que hay elementos interactuables
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // Verificar accesibilidad por teclado
    const firstButton = buttons.first();
    const isAccessible = await TestHelpers.verifyKeyboardAccessibility(firstButton);
    expect(isAccessible).toBe(true);
  });

  test('debería navegar usando solo el teclado', async ({ page }) => {
    await page.goto('/agency-portal/schools');
    await TestHelpers.waitForPageLoad(page);

    // Encontrar un botón específico
    const targetButton = AccessibilityHelper.getButton(page, /agregar|add/i);
    
    // Navegar hasta él usando solo el teclado
    await TestHelpers.navigateToElementWithKeyboard(page, targetButton);
    
    // Verificar que el botón tiene foco
    const hasFocus = await targetButton.evaluate((el) => el === document.activeElement);
    expect(hasFocus).toBe(true);
  });
});

// Ejemplo 4: Combinando selectores tradicionales con accesibilidad
test.describe('Combinando métodos de selección', () => {
  test.use({ project: 'chromium-authenticated' });

  test('debería usar fallback cuando no hay etiqueta accesible', async ({ page }) => {
    await page.goto('/agency-portal/schools');
    await TestHelpers.waitForPageLoad(page);

    // Intentar usar accesibilidad primero, luego fallback
    try {
      // Intentar con etiqueta accesible
      const field = AccessibilityHelper.getByLabel(page, 'Nombre');
      await field.fill('Test');
    } catch (error) {
      // Fallback a selector tradicional
      await TestHelpers.fillFormField(page, '[formControlName="name"]', 'Test');
    }
  });
});

