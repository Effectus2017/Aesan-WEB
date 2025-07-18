import { Page, expect } from '@playwright/test';

/**
 * Utilidades para tests de Playwright
 */
export class TestHelpers {

  /**
   * Esperar a que la página esté completamente cargada
   */
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
  }

  /**
   * Llenar un campo de formulario con validación
   */
  static async fillFormField(page: Page, selector: string, value: string): Promise<void> {
    await page.fill(selector, value);
    await expect(page.locator(selector)).toHaveValue(value);
  }

  /**
   * Seleccionar una opción de un dropdown
   */
  static async selectDropdownOption(page: Page, dropdownSelector: string, optionText?: string): Promise<void> {
    await page.click(dropdownSelector);

    if (optionText) {
      await page.click(`.mat-option:has-text("${optionText}")`);
    } else {
      await page.click('.mat-option:first-child');
    }
  }

  /**
   * Verificar que un campo tenga error de validación
   */
  static async expectFieldError(page: Page, fieldSelector: string): Promise<void> {
    await expect(page.locator(`${fieldSelector} + .mat-error`)).toBeVisible();
  }

  /**
   * Verificar que un campo no tenga error de validación
   */
  static async expectNoFieldError(page: Page, fieldSelector: string): Promise<void> {
    await expect(page.locator(`${fieldSelector} + .mat-error`)).not.toBeVisible();
  }

  /**
   * Hacer login (ajustar según tu implementación de auth)
   */
  static async login(page: Page, username: string, password: string): Promise<void> {
    await page.goto('/login');
    await this.fillFormField(page, '[data-cy=email-input]', username);
    await this.fillFormField(page, '[data-cy=password-input]', password);
    await page.click('[data-cy=submit-button]');
    await this.waitForPageLoad(page);
  }

    /**
   * Login específico para NUTRE con credenciales de desarrollo
   */
  static async loginNutre(page: Page): Promise<void> {
    await page.goto('https://nutre-dev.local:4202');
    await this.waitForPageLoad(page);

    // Verificar que el formulario esté presente
    await expect(page.locator('[data-cy=email-field]')).toBeVisible();
    await expect(page.locator('[data-cy=password-field]')).toBeVisible();

    // Ingresar credenciales de desarrollo
    await this.fillFormField(page, '[data-cy=email-input]', 'admin@admin.com');
    await this.fillFormField(page, '[data-cy=password-input]', '@dmin5812931!');

    // Hacer clic en el botón de login
    await page.click('[data-cy=submit-button]');

    // Esperar a que se complete la navegación
    await page.waitForLoadState('networkidle');

    // Verificar que se redirige correctamente (ajustar según el comportamiento real)
    // await expect(page).toHaveURL(/.*admin-portal.*/);
  }

  /**
   * Esperar a que aparezca un mensaje de notificación
   */
  static async waitForNotification(page: Page, type: 'success' | 'error' | 'warning' = 'success'): Promise<void> {
    await expect(page.locator(`.toast-${type}`)).toBeVisible();
  }

  /**
   * Verificar que un botón esté habilitado/deshabilitado
   */
  static async expectButtonState(page: Page, buttonSelector: string, enabled: boolean): Promise<void> {
    if (enabled) {
      await expect(page.locator(buttonSelector)).toBeEnabled();
    } else {
      await expect(page.locator(buttonSelector)).toBeDisabled();
    }
  }

  /**
   * Tomar screenshot con timestamp
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: `screenshots/${name}-${timestamp}.png` });
  }
}
