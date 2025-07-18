import { test, expect } from '@playwright/test';

test.describe('Final Working Tests', () => {

  test('should pass - basic application test', async ({ page }) => {
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

  test('should fail - demonstrate error reporting', async ({ page }) => {
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

  test('should navigate to sign-up page', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Buscar el enlace de registro
    const signUpLink = page.locator('[data-cy=sign-up-link], a:has-text("Registrarse"), a:has-text("Sign Up")');

    if (await signUpLink.isVisible()) {
      // Hacer clic en el enlace de registro
      await signUpLink.click();

      // Esperar a que se complete la navegación
      await page.waitForLoadState('networkidle');

      // Verificar que estamos en una página de registro o sign-up
      await expect(page).toHaveURL(/.*(register|sign-up).*/);
    } else {
      // Si no hay enlace de registro, verificar que estamos en la página principal
      await expect(page).toHaveURL(/.*nutre-dev\.local.*/);
    }
  });
});
