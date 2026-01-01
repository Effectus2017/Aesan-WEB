import { Page, expect, Locator } from '@playwright/test';
import { AccessibilityHelper } from './accessibility-helper';
import { AuthHelper } from './auth-helper';

/**
 * Utilidades para tests de Playwright
 * Mejorado con soporte para árbol de accesibilidad (MCP)
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
   * Mejorado: Intenta usar el árbol de accesibilidad primero
   */
  static async fillFormField(
    page: Page,
    selector: string,
    value: string,
    label?: string
  ): Promise<void> {
    let field: Locator;

    // Intentar usar el árbol de accesibilidad si se proporciona una etiqueta
    if (label) {
      try {
        field = AccessibilityHelper.getByLabel(page, label);
        await field.fill(value);
        await expect(field).toHaveValue(value);
        return;
      } catch (error) {
        // Si falla, usar el selector tradicional
        console.log(`⚠️ No se pudo encontrar campo por etiqueta "${label}", usando selector: ${selector}`);
      }
    }

    // Fallback al selector tradicional
    field = page.locator(selector);
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  /**
   * Seleccionar una opción de un dropdown
   * Mejorado: Usa el árbol de accesibilidad cuando es posible
   */
  static async selectDropdownOption(
    page: Page,
    dropdownSelector: string,
    optionText?: string,
    dropdownLabel?: string
  ): Promise<void> {
    let dropdown: Locator;

    // Intentar usar el árbol de accesibilidad si se proporciona una etiqueta
    if (dropdownLabel) {
      try {
        dropdown = AccessibilityHelper.getCombobox(page, dropdownLabel);
        await dropdown.click();
        await page.waitForTimeout(500);

        if (optionText) {
          const option = AccessibilityHelper.getOption(page, optionText);
          await option.click();
        } else {
          const firstOption = page.locator('.mat-option').first();
          await firstOption.click();
        }
        return;
      } catch (error) {
        // Si falla, usar el selector tradicional
        console.log(`⚠️ No se pudo encontrar dropdown por etiqueta "${dropdownLabel}", usando selector: ${dropdownSelector}`);
      }
    }

    // Fallback al selector tradicional
    dropdown = page.locator(dropdownSelector);
    await dropdown.click();
    await page.waitForTimeout(500);

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
   * Mejorado: Usa AuthHelper para gestión de estado
   */
  static async login(page: Page, username: string, password: string): Promise<void> {
    await page.goto('/login');
    await this.fillFormField(page, '[data-cy=email-input]', username);
    await this.fillFormField(page, '[data-cy=password-input]', password);
    
    const submitButton = AccessibilityHelper.getButton(page, /submit|iniciar|login/i)
      .or(page.locator('[data-cy=submit-button]'));
    await submitButton.click();
    
    await this.waitForPageLoad(page);
  }

  /**
   * Login específico para NUTRE con credenciales de desarrollo
   * Mejorado: Usa AuthHelper para guardar el estado
   */
  static async loginNutre(
    page: Page,
    email: string = 'admin@admin.com',
    password: string = '@dmin5812931!'
  ): Promise<void> {
    const loginSuccess = await AuthHelper.loginAndSaveState(page, email, password);
    
    if (!loginSuccess) {
      throw new Error('Login falló');
    }

    // Verificar que se redirige correctamente
    await this.waitForPageLoad(page);
  }

  /**
   * Esperar a que aparezca un mensaje de notificación
   * Mejorado: Usa el árbol de accesibilidad para encontrar notificaciones
   */
  static async waitForNotification(
    page: Page,
    type: 'success' | 'error' | 'warning' = 'success'
  ): Promise<void> {
    // Intentar encontrar por rol de alerta
    const alert = page.getByRole('alert');
    if (await alert.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(alert).toBeVisible();
      return;
    }

    // Fallback al selector tradicional
    await expect(page.locator(`.toast-${type}, mat-snack-bar-container`)).toBeVisible();
  }

  /**
   * Verificar que un botón esté habilitado/deshabilitado
   * Mejorado: Usa el árbol de accesibilidad cuando es posible
   */
  static async expectButtonState(
    page: Page,
    buttonSelector: string | RegExp,
    enabled: boolean,
    buttonText?: string
  ): Promise<void> {
    let button: Locator;

    // Intentar usar el árbol de accesibilidad si se proporciona texto
    if (buttonText) {
      try {
        button = AccessibilityHelper.getButton(page, buttonText);
        if (enabled) {
          await expect(button).toBeEnabled();
        } else {
          await expect(button).toBeDisabled();
        }
        return;
      } catch (error) {
        // Si falla, usar el selector tradicional
        console.log(`⚠️ No se pudo encontrar botón por texto "${buttonText}", usando selector: ${buttonSelector}`);
      }
    }

    // Fallback al selector tradicional
    if (typeof buttonSelector === 'string') {
      button = page.locator(buttonSelector);
    } else {
      button = page.getByRole('button', { name: buttonSelector });
    }

    if (enabled) {
      await expect(button).toBeEnabled();
    } else {
      await expect(button).toBeDisabled();
    }
  }

  /**
   * Tomar screenshot con timestamp
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotsDir = 'tests/screenshots';
    await page.screenshot({ path: `${screenshotsDir}/${name}-${timestamp}.png`, fullPage: true });
  }

  /**
   * Hacer clic en un botón usando el árbol de accesibilidad
   * @param page Página de Playwright
   * @param buttonText Texto del botón
   * @param exact Si es true, busca coincidencia exacta
   */
  static async clickButton(
    page: Page,
    buttonText: string | RegExp,
    exact: boolean = false
  ): Promise<void> {
    const button = AccessibilityHelper.getButton(page, buttonText, exact);
    await button.click();
  }

  /**
   * Llenar un campo usando su etiqueta (más robusto)
   * @param page Página de Playwright
   * @param label Etiqueta del campo
   * @param value Valor a ingresar
   */
  static async fillFieldByLabel(
    page: Page,
    label: string | RegExp,
    value: string
  ): Promise<void> {
    const field = AccessibilityHelper.getByLabel(page, label);
    await field.fill(value);
    await expect(field).toHaveValue(value);
  }

  /**
   * Verificar que un elemento sea accesible por teclado
   * @param locator Locator del elemento
   */
  static async verifyKeyboardAccessibility(locator: Locator): Promise<boolean> {
    return await AccessibilityHelper.isKeyboardAccessible(locator);
  }

  /**
   * Navegar a un elemento usando solo el teclado
   * @param page Página de Playwright
   * @param locator Locator del elemento objetivo
   */
  static async navigateToElementWithKeyboard(page: Page, locator: Locator): Promise<void> {
    await AccessibilityHelper.navigateWithKeyboard(page, locator);
  }
}
