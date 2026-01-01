import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Configuración de Playwright con soporte para MCP (Model Context Protocol)
 * 
 * Características habilitadas:
 * - Estado de autenticación persistente para evitar re-login en cada test
 * - Configuración optimizada para uso con MCP
 * - Proyectos separados para tests autenticados y no autenticados
 * 
 * @see https://playwright.dev/docs/test-configuration
 * @see https://github.com/microsoft/playwright-mcp
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://nutre-dev.local:4202',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Ignorar errores de HTTPS para desarrollo local */
    ignoreHTTPSErrors: true,

    /* Timeout para acciones */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup: Proyecto que ejecuta el login y guarda el estado de autenticación
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Chromium con autenticación: Usa el estado guardado por setup
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        // Cargar estado de autenticación si existe
        storageState: path.join(__dirname, 'tests', '.auth', 'user.json'),
      },
      dependencies: ['setup'],
    },

    // Chromium sin autenticación: Para tests que no requieren login
    {
      name: 'chromium-unauthenticated',
      use: { ...devices['Desktop Chrome'] },
    },

    // Firefox con autenticación
    {
      name: 'firefox-authenticated',
      use: {
        ...devices['Desktop Firefox'],
        storageState: path.join(__dirname, 'tests', '.auth', 'user.json'),
      },
      dependencies: ['setup'],
    },

    // Firefox sin autenticación
    {
      name: 'firefox-unauthenticated',
      use: { ...devices['Desktop Firefox'] },
    },

    // WebKit con autenticación
    {
      name: 'webkit-authenticated',
      use: {
        ...devices['Desktop Safari'],
        storageState: path.join(__dirname, 'tests', '.auth', 'user.json'),
      },
      dependencies: ['setup'],
    },

    // WebKit sin autenticación
    {
      name: 'webkit-unauthenticated',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run local',
  //   url: 'https://nutre-dev.local:4202',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
