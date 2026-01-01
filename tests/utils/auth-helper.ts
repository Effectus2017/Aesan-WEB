import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper para gestión de autenticación y estado de sesión
 * Permite guardar y reutilizar el estado de autenticación entre tests
 */
export class AuthHelper {
  private static readonly AUTH_DIR = path.join(__dirname, '..', '.auth');
  private static readonly STORAGE_STATE_PATH = path.join(
    AuthHelper.AUTH_DIR,
    'user.json'
  );

  /**
   * Asegurar que el directorio de autenticación existe
   */
  private static ensureAuthDir(): void {
    if (!fs.existsSync(this.AUTH_DIR)) {
      fs.mkdirSync(this.AUTH_DIR, { recursive: true });
    }
  }

  /**
   * Realizar login y guardar el estado de autenticación
   * @param page Página de Playwright
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns true si el login fue exitoso
   */
  static async loginAndSaveState(
    page: Page,
    email: string = 'admin@admin.com',
    password: string = '@dmin5812931!'
  ): Promise<boolean> {
    console.log('🔐 Iniciando proceso de login y guardando estado...');

    await page.goto('https://nutre-dev.local:4202');
    await page.waitForLoadState('networkidle');

    // Verificar si ya estamos logueados
    const loginForm = page.locator('[data-cy=email-field]');
    if (!(await loginForm.isVisible({ timeout: 3000 }))) {
      console.log('✅ Ya estamos logueados, guardando estado actual...');
      await this.saveStorageState(page.context());
      return true;
    }

    try {
      console.log('📝 Llenando credenciales...');
      await page.fill('[data-cy=email-input]', email);
      await page.fill('[data-cy=password-input]', password);

      console.log('🖱️ Haciendo clic en el botón de login...');
      await page.click('[data-cy=submit-button]');

      // Esperar a que se complete el login
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);

      // Verificar si el login fue exitoso
      const currentUrl = page.url();
      console.log(`📍 URL después del login: ${currentUrl}`);

      // Si aún estamos en la página de login, el login falló
      if (
        currentUrl.includes('login') ||
        (await loginForm.isVisible({ timeout: 2000 }).catch(() => false))
      ) {
        console.log('❌ Login falló');
        return false;
      }

      // Verificar que no estamos en la página de login
      const isNotLoginPage =
        !currentUrl.includes('/login') &&
        !currentUrl.endsWith('nutre-dev.local:4202/') &&
        !currentUrl.endsWith('nutre-dev.local:4202');

      if (
        isNotLoginPage ||
        currentUrl.includes('agency-portal') ||
        currentUrl.includes('dashboard') ||
        currentUrl.includes('admin-portal')
      ) {
        console.log('✅ Login exitoso, guardando estado...');
        await this.saveStorageState(page.context());
        return true;
      }

      console.log('❌ Login falló - URL inesperada');
      return false;
    } catch (error: any) {
      console.log(`❌ Error durante el login: ${error.message}`);
      return false;
    }
  }

  /**
   * Guardar el estado de almacenamiento del contexto
   * @param context Contexto del navegador
   */
  static async saveStorageState(context: BrowserContext): Promise<void> {
    this.ensureAuthDir();
    await context.storageState({ path: this.STORAGE_STATE_PATH });
    console.log(`💾 Estado de autenticación guardado en: ${this.STORAGE_STATE_PATH}`);
  }

  /**
   * Verificar si existe un estado de autenticación guardado
   * @returns true si existe el archivo de estado
   */
  static hasStoredAuthState(): boolean {
    return fs.existsSync(this.STORAGE_STATE_PATH);
  }

  /**
   * Obtener la ruta del estado de almacenamiento
   * @returns Ruta del archivo de estado
   */
  static getStorageStatePath(): string {
    return this.STORAGE_STATE_PATH;
  }

  /**
   * Eliminar el estado de autenticación guardado
   */
  static clearStoredAuthState(): void {
    if (fs.existsSync(this.STORAGE_STATE_PATH)) {
      fs.unlinkSync(this.STORAGE_STATE_PATH);
      console.log('🗑️ Estado de autenticación eliminado');
    }
  }

  /**
   * Verificar si el usuario está autenticado en la página actual
   * @param page Página de Playwright
   * @returns true si el usuario está autenticado
   */
  static async isAuthenticated(page: Page): Promise<boolean> {
    const loginForm = page.locator('[data-cy=email-field]');
    const isLoginVisible = await loginForm.isVisible({ timeout: 2000 }).catch(() => false);
    return !isLoginVisible;
  }
}

