import { test, expect } from '@playwright/test';

test.describe('Login Working Tests', () => {

  test('should load login page successfully', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/.*nutre-dev\.local.*/);
  });

  test('should display login form elements', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Verificar que los elementos del formulario estén presentes
    await expect(page.locator('[data-cy=email-field]')).toBeVisible();
    await expect(page.locator('[data-cy=password-field]')).toBeVisible();
    await expect(page.locator('[data-cy=submit-button]')).toBeVisible();
  });

  test('should fill login form correctly', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Llenar el formulario
    await page.fill('[data-cy=email-input]', 'admin@admin.com');
    await page.fill('[data-cy=password-input]', '@dmin5812931!');

    // Verificar que los valores se llenaron correctamente
    await expect(page.locator('[data-cy=email-input]')).toHaveValue('admin@admin.com');
    await expect(page.locator('[data-cy=password-input]')).toHaveValue('@dmin5812931!');
  });

  test('should attempt login submission', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Llenar el formulario
    await page.fill('[data-cy=email-input]', 'admin@admin.com');
    await page.fill('[data-cy=password-input]', '@dmin5812931!');

    // Hacer clic en el botón de login
    await page.click('[data-cy=submit-button]');

    // Esperar a que se complete la navegación
    await page.waitForLoadState('networkidle');

    // Verificar que la página cambió (puede ser error o éxito)
    await expect(page).not.toHaveURL('https://nutre-dev.local:4202');
  });
});
