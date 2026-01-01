import { test as setup, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';

/**
 * Setup global para autenticación
 * Este archivo se ejecuta antes de los tests que requieren autenticación
 * y guarda el estado de la sesión para reutilizarlo
 */
setup('authentication setup', async ({ page }) => {
  console.log('🔧 Configurando autenticación...');

  // Verificar si ya existe un estado guardado
  if (AuthHelper.hasStoredAuthState()) {
    console.log('✅ Estado de autenticación ya existe, verificando validez...');
    
    // Intentar usar el estado existente
    const context = page.context();
    await context.addCookies([]); // Esto cargará el estado si es válido
    
    // Verificar si el estado sigue siendo válido
    await page.goto('https://nutre-dev.local:4202');
    await page.waitForLoadState('networkidle');
    
    const isAuthenticated = await AuthHelper.isAuthenticated(page);
    
    if (isAuthenticated) {
      console.log('✅ Estado de autenticación válido, reutilizando...');
      // Actualizar el estado por si acaso
      await AuthHelper.saveStorageState(context);
      return;
    } else {
      console.log('⚠️ Estado de autenticación expirado, realizando nuevo login...');
      AuthHelper.clearStoredAuthState();
    }
  }

  // Realizar login y guardar estado
  const loginSuccess = await AuthHelper.loginAndSaveState(page);
  
  if (!loginSuccess) {
    throw new Error('No se pudo realizar el login durante el setup');
  }

  // Verificar que estamos autenticados
  const isAuthenticated = await AuthHelper.isAuthenticated(page);
  expect(isAuthenticated).toBe(true);
  
  console.log('✅ Setup de autenticación completado');
});

