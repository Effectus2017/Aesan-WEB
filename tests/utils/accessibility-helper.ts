import { Page, Locator } from '@playwright/test';

/**
 * Helper para interactuar con elementos usando el árbol de accesibilidad
 * Aprovecha las capacidades de MCP para encontrar elementos de forma más robusta
 */
export class AccessibilityHelper {
  /**
   * Encontrar elemento por su rol y nombre accesible
   * @param page Página de Playwright
   * @param role Rol del elemento (button, textbox, link, etc.)
   * @param name Nombre accesible del elemento
   * @returns Locator del elemento
   */
  static getByRole(
    page: Page,
    role: 'button' | 'textbox' | 'link' | 'heading' | 'checkbox' | 'radio' | 'combobox' | 'option',
    name: string | RegExp
  ): Locator {
    return page.getByRole(role, { name });
  }

  /**
   * Encontrar botón por su texto accesible
   * @param page Página de Playwright
   * @param name Nombre del botón
   * @param exact Si es true, busca coincidencia exacta
   * @returns Locator del botón
   */
  static getButton(page: Page, name: string | RegExp, exact: boolean = false): Locator {
    return page.getByRole('button', { name, exact });
  }

  /**
   * Encontrar campo de texto por su etiqueta
   * @param page Página de Playwright
   * @param label Etiqueta del campo
   * @returns Locator del campo de texto
   */
  static getTextField(page: Page, label: string | RegExp): Locator {
    return page.getByRole('textbox', { name: label });
  }

  /**
   * Encontrar enlace por su texto
   * @param page Página de Playwright
   * @param name Texto del enlace
   * @returns Locator del enlace
   */
  static getLink(page: Page, name: string | RegExp): Locator {
    return page.getByRole('link', { name });
  }

  /**
   * Encontrar elemento por su texto visible
   * @param page Página de Playwright
   * @param text Texto a buscar
   * @param exact Si es true, busca coincidencia exacta
   * @returns Locator del elemento
   */
  static getByText(page: Page, text: string | RegExp, exact: boolean = false): Locator {
    return page.getByText(text, { exact });
  }

  /**
   * Encontrar elemento por su etiqueta (label)
   * @param page Página de Playwright
   * @param label Texto de la etiqueta
   * @returns Locator del elemento asociado a la etiqueta
   */
  static getByLabel(page: Page, label: string | RegExp): Locator {
    return page.getByLabel(label);
  }

  /**
   * Encontrar elemento por su placeholder
   * @param page Página de Playwright
   * @param placeholder Texto del placeholder
   * @returns Locator del elemento
   */
  static getByPlaceholder(page: Page, placeholder: string | RegExp): Locator {
    return page.getByPlaceholder(placeholder);
  }

  /**
   * Encontrar elemento por su título (title attribute)
   * @param page Página de Playwright
   * @param title Texto del título
   * @returns Locator del elemento
   */
  static getByTitle(page: Page, title: string | RegExp): Locator {
    return page.getByTitle(title);
  }

  /**
   * Encontrar elemento por su test id (data-testid o data-cy)
   * @param page Página de Playwright
   * @param testId ID del test
   * @returns Locator del elemento
   */
  static getByTestId(page: Page, testId: string): Locator {
    return page.getByTestId(testId).or(page.locator(`[data-cy="${testId}"]`));
  }

  /**
   * Encontrar heading por su nivel y texto
   * @param page Página de Playwright
   * @param level Nivel del heading (1-6)
   * @param name Texto del heading
   * @returns Locator del heading
   */
  static getHeading(
    page: Page,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    name?: string | RegExp
  ): Locator {
    return page.getByRole('heading', { level, name });
  }

  /**
   * Encontrar checkbox por su etiqueta
   * @param page Página de Playwright
   * @param label Etiqueta del checkbox
   * @returns Locator del checkbox
   */
  static getCheckbox(page: Page, label: string | RegExp): Locator {
    return page.getByRole('checkbox', { name: label });
  }

  /**
   * Encontrar radio button por su etiqueta
   * @param page Página de Playwright
   * @param label Etiqueta del radio button
   * @returns Locator del radio button
   */
  static getRadio(page: Page, label: string | RegExp): Locator {
    return page.getByRole('radio', { name: label });
  }

  /**
   * Encontrar combobox (select) por su etiqueta
   * @param page Página de Playwright
   * @param label Etiqueta del combobox
   * @returns Locator del combobox
   */
  static getCombobox(page: Page, label: string | RegExp): Locator {
    return page.getByRole('combobox', { name: label });
  }

  /**
   * Encontrar opción en un combobox
   * @param page Página de Playwright
   * @param name Nombre de la opción
   * @returns Locator de la opción
   */
  static getOption(page: Page, name: string | RegExp): Locator {
    return page.getByRole('option', { name });
  }

  /**
   * Obtener el árbol de accesibilidad de la página
   * Útil para debugging y entender la estructura de la página
   * @param page Página de Playwright
   * @returns Árbol de accesibilidad como string
   */
  static async getAccessibilityTree(page: Page): Promise<string> {
    return await page.accessibility.snapshot();
  }

  /**
   * Verificar que un elemento sea accesible por teclado
   * @param locator Locator del elemento
   * @returns true si el elemento es accesible por teclado
   */
  static async isKeyboardAccessible(locator: Locator): Promise<boolean> {
    const tabIndex = await locator.getAttribute('tabindex');
    const disabled = await locator.isDisabled();
    const hidden = await locator.isHidden();

    // Elemento accesible si:
    // - No está deshabilitado
    // - No está oculto
    // - Tiene tabindex >= 0 o es un elemento interactivo por defecto
    return !disabled && !hidden && (tabIndex === null || parseInt(tabIndex) >= 0);
  }

  /**
   * Navegar a un elemento usando solo el teclado
   * @param page Página de Playwright
   * @param locator Locator del elemento objetivo
   */
  static async navigateWithKeyboard(page: Page, locator: Locator): Promise<void> {
    // Presionar Tab hasta llegar al elemento
    let found = false;
    let attempts = 0;
    const maxAttempts = 50;

    while (!found && attempts < maxAttempts) {
      const focused = await page.evaluate(() => {
        return document.activeElement;
      });

      if (focused && (await locator.evaluate((el) => el.contains(document.activeElement)))) {
        found = true;
      } else {
        await page.keyboard.press('Tab');
        attempts++;
        await page.waitForTimeout(100);
      }
    }

    if (!found) {
      throw new Error('No se pudo navegar al elemento usando el teclado');
    }
  }
}

