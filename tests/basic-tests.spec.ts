import { test, expect } from '@playwright/test';

test.describe('Basic Tests - Success and Failure', () => {

  test('should pass - basic navigation test', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*nutre-dev\.local.*/);

    // Verificar que el formulario de login esté presente
    await expect(page.locator('[data-cy=email-field]')).toBeVisible();
    await expect(page.locator('[data-cy=password-field]')).toBeVisible();

    // Este test debe pasar
    expect(true).toBe(true);
  });

  test('should fail - element not found test', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Intentar encontrar un elemento que no existe
    // Esto debería fallar y mostrar un mensaje de error claro
    await expect(page.locator('[data-cy=non-existent-element]')).toBeVisible();

    // Este test debe fallar
    expect(false).toBe(true);
  });
});
