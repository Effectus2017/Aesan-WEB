import { test, expect } from '@playwright/test';

test.describe('Schools Add Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de agregar escuela
    await page.goto('/agency-portal/schools/add');
  });

  test('should display the add school form', async ({ page }) => {
    // Verificar que el formulario esté presente
    await expect(page.locator('app-schools-add')).toBeVisible();

    // Verificar campos requeridos
    await expect(page.locator('[formControlName="name"]')).toBeVisible();
    await expect(page.locator('[formControlName="address"]')).toBeVisible();
    await expect(page.locator('[formControlName="city"]')).toBeVisible();
    await expect(page.locator('[formControlName="region"]')).toBeVisible();
    await expect(page.locator('[formControlName="zipCode"]')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Intentar enviar el formulario sin datos
    await page.click('button[type="submit"]');

    // Verificar que se muestren errores de validación
    await expect(page.locator('.mat-error')).toBeVisible();
  });

  test('should fill and submit the form successfully', async ({ page }) => {
    // Llenar información básica
    await page.fill('[formControlName="name"]', 'Escuela Test Playwright');
    await page.fill('[formControlName="address"]', '123 Calle Test');
    await page.fill('[formControlName="zipCode"]', '12345');

    // Seleccionar ciudad (asumiendo que hay opciones disponibles)
    await page.click('[formControlName="city"]');
    await page.click('.mat-option:first-child');

    // Seleccionar región
    await page.click('[formControlName="region"]');
    await page.click('.mat-option:first-child');

    // Seleccionar tipo de organización
    await page.click('[formControlName="organizationType"]');
    await page.click('.mat-option:first-child');

    // Seleccionar tipo de centro
    await page.click('[formControlName="centerType"]');
    await page.click('.mat-option:first-child');

    // Seleccionar niveles educativos (múltiple selección)
    await page.click('[formControlName="educationLevels"]');
    await page.click('.mat-option:first-child');

    // Seleccionar días de operación
    await page.selectOption('[formControlName="operatingDays"]', '5');

    // Seleccionar tipo de cocina
    await page.click('[formControlName="kitchenType"]');
    await page.click('.mat-option:first-child');

    // Seleccionar tipo de grupo
    await page.click('[formControlName="groupType"]');
    await page.click('.mat-option:first-child');

    // Seleccionar tipo de entrega
    await page.click('[formControlName="deliveryType"]');
    await page.click('.mat-option:first-child');

    // Seleccionar tipo de área
    await page.click('[formControlName="areaType"]');
    await page.click('.mat-option:first-child');

    // Seleccionar tipo de residencial
    await page.click('[formControlName="typeOfResidential"]');
    await page.click('.mat-option:first-child');

    // Seleccionar política de operación
    await page.click('[formControlName="operatingPolicy"]');
    await page.click('.mat-option:first-child');

    // Llenar información de contacto
    await page.fill('[formControlName="administratorAuthorizedName"]', 'Admin Test');
    await page.fill('[formControlName="sitePhone"]', '787-123-4567');
    await page.fill('[formControlName="mobilePhone"]', '787-987-6543');

    // Configurar horarios
    await page.check('[formControlName="breakfast"]');
    await page.fill('[formControlName="breakfastFrom"]', '07:00');
    await page.fill('[formControlName="breakfastTo"]', '08:00');

    await page.check('[formControlName="lunch"]');
    await page.fill('[formControlName="lunchFrom"]', '11:30');
    await page.fill('[formControlName="lunchTo"]', '12:30');

    // Enviar formulario
    await page.click('button[type="submit"]');

    // Verificar que se muestre mensaje de éxito o redirección
    // Nota: Esto dependerá de cómo manejes las respuestas en tu aplicación
    await expect(page).toHaveURL(/.*schools.*/);
  });

  test('should handle same as physical address checkbox', async ({ page }) => {
    // Llenar dirección física
    await page.fill('[formControlName="address"]', '123 Calle Test');
    await page.fill('[formControlName="zipCode"]', '12345');

    // Seleccionar ciudad y región
    await page.click('[formControlName="city"]');
    await page.click('.mat-option:first-child');
    await page.click('[formControlName="region"]');
    await page.click('.mat-option:first-child');

    // Marcar checkbox de misma dirección
    await page.check('[formControlName="sameAsPhysicalAddress"]');

    // Verificar que se copien los valores
    await expect(page.locator('[formControlName="postalAddress"]')).toHaveValue('123 Calle Test');
    await expect(page.locator('[formControlName="postalZipCode"]')).toHaveValue('12345');
  });

  test('should handle form cancellation', async ({ page }) => {
    // Hacer clic en cancelar
    await page.click('button:has-text("Cancel")');

    // Verificar redirección a la lista
    await expect(page).toHaveURL(/.*schools\/list.*/);
  });
});
