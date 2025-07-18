import { test, expect } from '@playwright/test';

test.describe('Sponsor Registration Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Interceptar las solicitudes como en Cypress
    await page.route('https://localhost:5002/auth/login', async route => {
      await route.continue();
    });

    await page.route('https://localhost:5002/program/get-all-programs-from-db?take=25&skip=0&alls=false&names=PDAM,PSAV,PACNA', async route => {
      await route.continue();
    });

    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Hacer clic en el enlace de registro
    await page.locator('[data-cy=sign-up-link]').click();

    // Esperar a que se carguen los programas
    await page.waitForLoadState('networkidle');

    // Verificar que el formulario de registro esté visible
    await expect(page.locator('[data-cy=sign-up-form]')).toBeVisible();
  });

  test('should register sponsor successfully with valid data', async ({ page }) => {
    // Navegar directamente a la página de registro
    await page.goto('/sponsor/register');

    // Seleccionar programa PDAM
    await page.locator('[data-cy=program-select]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=program-select]').click();
    await page.locator('mat-option:has-text("PDAM")').click();

    // Campos de elegibilidad
    // Non-profit
    await page.locator('[data-cy=non-profit-field]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=non-profit-field]').click();
    await page.locator('mat-option:has-text("Sí")').click();

    // Basic education registry
    await page.locator('[data-cy=basic-education-registry-field]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=basic-education-registry-field]').click();
    await page.locator('mat-option:has-text("Sí")').click();

    // Federal funds denied
    await page.locator('[data-cy=federal-funds-denied-field]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=federal-funds-denied-field]').click();
    await page.locator('mat-option:has-text("No")').click();

    // State funds denied
    await page.locator('[data-cy=state-funds-denied-field]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=state-funds-denied-field]').click();
    await page.locator('mat-option:has-text("No")').click();

    // Organized athletic programs
    await page.locator('[data-cy=organized-athletic-programs-field]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=organized-athletic-programs-field]').click();
    await page.locator('mat-option:has-text("Sí")').click();

    // Datos de la agencia
    await page.locator('[data-cy=agency-name]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=agency-name]').fill('Agencia de Prueba');

    await page.locator('[data-cy=sdr-number]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=sdr-number]').fill('123456');

    await page.locator('[data-cy=uie-number]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=uie-number]').fill('789012');

    await page.locator('[data-cy=ein-number]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=ein-number]').fill('345678');

    // Ubicación
    await page.locator('[data-cy=address]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=address]').fill('Calle Principal #123');

    await page.locator('[data-cy=city-select]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=city-select]').click();
    await page.locator('mat-option:has-text("Camuy")').click();

    await page.locator('[data-cy=zip-code]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=zip-code]').fill('00627');

    await page.locator('[data-cy=latitude]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=latitude]').fill('18.4834');

    await page.locator('[data-cy=longitude]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=longitude]').fill('-66.8451');

    // Copiar dirección física a postal
    await page.locator('[data-cy=copy-address]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=copy-address]').click();

    // Información de contacto
    await page.locator('[data-cy=email]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=email]').fill('prueba@agencia.com');

    await page.locator('[data-cy=phone]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=phone]').fill('7871234567');

    await page.locator('[data-cy=administration-title]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=administration-title]').fill('Director Ejecutivo');

    // Tiempo de servicio
    await page.locator('[data-cy=service-time]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=service-time]').fill('2022-01-01');

    // Interceptar la solicitud POST
    const registerAgencyPromise = page.waitForResponse(response =>
      response.url().includes('/api/agency') && response.request().method() === 'POST'
    );

    // Enviar el formulario
    await page.locator('[data-cy=submit-button]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=submit-button]').click();

    // Esperar la respuesta
    const response = await registerAgencyPromise;

    // Verificar que la solicitud fue exitosa
    expect(response.status()).toBe(200);

    // Verificar que la respuesta contiene los datos esperados
    const responseBody = await response.json();
    expect(responseBody).toBeDefined();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('/sponsor/register');

    // Intentar enviar el formulario sin llenar campos requeridos
    await page.locator('[data-cy=submit-button]').scrollIntoViewIfNeeded();
    await page.locator('[data-cy=submit-button]').click();

    // Verificar que se muestren errores de validación
    await expect(page.locator('.mat-error')).toBeVisible();
  });
});
