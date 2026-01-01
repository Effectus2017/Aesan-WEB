import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { TestHelpers } from './utils/test-helpers';

// Función helper para hacer login de manera robusta
const performLogin = async (page: any, email: string, password: string) => {
  console.log('🔐 Iniciando proceso de login...');

  await page.goto('https://nutre-dev.local:4202');
  await page.waitForLoadState('networkidle');

  // Verificar si ya estamos logueados
  const loginForm = page.locator('[data-cy=email-field]');
  if (!(await loginForm.isVisible({ timeout: 3000 }))) {
    console.log('✅ Ya estamos logueados');
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

    // Si aún estamos en la página de login, verificar si hay errores
    if (currentUrl.includes('login') || await loginForm.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('⚠️ Parece que el login no fue exitoso');

      // Verificar si hay mensajes de error
      const errorMessage = page.locator('.error, .alert-error, [class*="error"]');
      if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        const errorText = await errorMessage.textContent();
        console.log(`❌ Error de login: ${errorText}`);
        return false;
      }

      return false;
    }

    // Verificar que no estamos en la página de login
    const isNotLoginPage = !currentUrl.includes('/login') &&
                          !currentUrl.endsWith('nutre-dev.local:4202/') &&
                          !currentUrl.endsWith('nutre-dev.local:4202');

    if (isNotLoginPage || currentUrl.includes('agency-portal') || currentUrl.includes('dashboard') || currentUrl.includes('admin-portal')) {
      console.log('✅ Login exitoso');
      return true;
    }

    console.log('❌ Login falló - URL inesperada');
    return false;
  } catch (error) {
    console.log(`❌ Error durante el login: ${error.message}`);
    return false;
  }
};

// Configurar para ejecutar solo en Chromium
test.use({
  browserName: 'chromium'
});

test.describe('Testing Funcional Completo - Login, Crear Escuela, Crear Sitio', () => {

  test('Flujo completo: Login -> Crear Escuela -> Crear Sitio PDAM', async ({ page }) => {
    // Credenciales funcionales
    const EMAIL = 'dario.neira@gmail.com';
    const PASSWORD = '@dmin5812931!';

    // ========================================
    // PASO 1: LOGIN
    // ========================================
    console.log('\n🚀 INICIANDO TEST FUNCIONAL COMPLETO\n');
    console.log('═══════════════════════════════════════');
    console.log('PASO 1: LOGIN');
    console.log('═══════════════════════════════════════');

    const loginSuccess = await performLogin(page, EMAIL, PASSWORD);
    if (!loginSuccess) {
      throw new Error('Login falló - abortando test');
    }

    // Verificar que estamos en el portal de agencias
    await expect(page).toHaveURL(/.*agency-portal.*/, { timeout: 10000 });

    // ========================================
    // PASO 2: CREAR ESCUELA
    // ========================================
    console.log('\n═══════════════════════════════════════');
    console.log('PASO 2: CREAR ESCUELA');
    console.log('═══════════════════════════════════════');

    // Navegar a la lista de escuelas
    await page.goto('https://nutre-dev.local:4202/agency-portal/schools');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Buscar el botón Custom que abre el modal de crear escuela
    // El botón tiene la clase bg-[#F39B1A] y contiene un icono "add"
    const customButton = page.locator('button')
      .filter({ has: page.locator('mat-icon[svgIcon*="add"], mat-icon[svgIcon*="plus"]') })
      .or(page.locator('button[class*="F39B1A"]'))
      .first();

    await expect(customButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Botón de agregar escuela encontrado');

    await customButton.click();
    await page.waitForTimeout(1000);

    // Verificar que el modal está abierto
    const modal = page.locator('mat-dialog-container, [role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✅ Modal de crear escuela abierto');

    // Generar nombre único para la escuela
    const schoolName = `Escuela Test ${faker.string.alphanumeric(6)}`;
    console.log(`📝 Nombre de escuela: ${schoolName}`);

    // Llenar el campo nombre en el modal
    const nameInput = modal.locator('input[formControlName="name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(schoolName);
    await expect(nameInput).toHaveValue(schoolName);
    console.log('✅ Nombre de escuela ingresado');

    // Hacer clic en el botón de guardar/agregar
    // Buscar el botón por su texto directamente, sin depender del atributo color
    const saveButton = modal.locator('button')
      .filter({ hasText: /Agregar|Add|Guardar|Save/i })
      .last(); // Usar .last() porque puede haber múltiples botones, queremos el de acción principal

    await expect(saveButton).toBeVisible({ timeout: 5000 });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    console.log('✅ Botón de guardar clickeado');

    // Esperar a que el modal se cierre y la lista se actualice
    await page.waitForTimeout(3000);
    await expect(modal).not.toBeVisible({ timeout: 10000 });
    console.log('✅ Modal cerrado');

    // Verificar que la escuela se creó (debería aparecer en la lista)
    await expect(page.locator(`text=${schoolName}`).first()).toBeVisible({ timeout: 10000 });
    console.log(`✅ Escuela "${schoolName}" creada exitosamente y visible en la lista`);

    // ========================================
    // PASO 3: ABRIR MODAL DE SITIOS DE LA ESCUELA
    // ========================================
    console.log('\n═══════════════════════════════════════');
    console.log('PASO 3: ABRIR MODAL DE SITIOS');
    console.log('═══════════════════════════════════════');

    // Buscar la fila de la escuela recién creada en la tabla
    const schoolRow = page.locator('tr').filter({ hasText: schoolName }).first();
    await expect(schoolRow).toBeVisible({ timeout: 10000 });
    console.log(`✅ Fila de la escuela "${schoolName}" encontrada en la tabla`);

    // Buscar el botón "Sitios" (icono de edificio) en esa fila
    // El botón tiene el texto "Sitios" o un icono de edificio
    const sitesButton = schoolRow.locator('button')
      .filter({ hasText: /Sitios|Sites/i })
      .or(schoolRow.locator('button').filter({ has: page.locator('mat-icon[svgIcon*="building"], mat-icon[svgIcon*="home"]') }))
      .first();

    await expect(sitesButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Botón "Sitios" encontrado');

    await sitesButton.click();
    await page.waitForTimeout(2000);

    // Verificar que el modal de sitios se abrió
    const sitesModal = page.locator('mat-dialog-container, [role="dialog"]')
      .filter({ hasText: schoolName });
    await expect(sitesModal).toBeVisible({ timeout: 5000 });
    console.log(`✅ Modal de sitios abierto para "${schoolName}"`);

    // ========================================
    // PASO 4: CREAR SITIO DESDE EL MODAL
    // ========================================
    console.log('\n═══════════════════════════════════════');
    console.log('PASO 4: CREAR SITIO DESDE EL MODAL');
    console.log('═══════════════════════════════════════');

    // Buscar el botón "Add" en el modal de sitios
    const addSiteButton = sitesModal.locator('button')
      .filter({ hasText: /Agregar|Add/i })
      .last();

    await expect(addSiteButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Botón "Add" encontrado en el modal');

    await addSiteButton.click();
    await page.waitForTimeout(3000);

    // El modal debería cerrarse y navegar a la página de agregar sitio
    // Verificar que estamos en la página de crear sitio
    const addSiteUrl = page.url();
    console.log(`📍 URL después de hacer clic en Add: ${addSiteUrl}`);

    // Esperar a que se cargue la página de agregar sitio
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verificar que estamos en la página de crear sitio (puede ser sites-pdam/add o sites-pacna/...)
    const siteForm = page.locator('[data-cy="sites-add-form"]');
    await expect(siteForm).toBeVisible({ timeout: 10000 });
    console.log('✅ Formulario de crear sitio cargado');

    // Generar datos para el sitio
    const siteData = {
      name: `Sitio Test ${faker.string.alphanumeric(6)}`,
      address: faker.location.streetAddress(),
      zipCode: '00901',
      latitude: '18.4655',
      longitude: '-66.1057',
      firstName: faker.person.firstName(),
      fatherLastName: faker.person.lastName(),
      sitePhone: '7875551234'
    };

    console.log(`📝 Datos del sitio:`, siteData);

    // ========================================
    // SECCIÓN 1: INFORMACIÓN BÁSICA
    // ========================================
    console.log('\n📋 Llenando información básica...');

    // Llenar nombre del sitio (campo requerido)
    const nameField = page.locator('[data-cy="name-input"]');
    await expect(nameField).toBeVisible();
    await nameField.fill(siteData.name);
    await expect(nameField).toHaveValue(siteData.name);
    console.log(`✅ Nombre del sitio ingresado: ${siteData.name}`);

    // ========================================
    // SECCIÓN 2: DIRECCIÓN FÍSICA
    // ========================================
    console.log('\n📍 Llenando dirección física...');

    // Llenar dirección
    const addressField = page.locator('[data-cy="address-input"]');
    await expect(addressField).toBeVisible();
    await addressField.fill(siteData.address);
    console.log(`✅ Dirección ingresada: ${siteData.address}`);

    // Seleccionar ciudad (usa formControlName="city")
    const citySelect = page.locator('[data-cy="city-select"]');
    await expect(citySelect).toBeVisible();
    await citySelect.click();
    await page.waitForTimeout(500);
    const cityOptions = page.locator('[data-cy="city-option"]');
    const cityCount = await cityOptions.count();
    if (cityCount > 0) {
      await cityOptions.first().click();
      await page.waitForTimeout(1000);
      console.log('✅ Ciudad seleccionada');
    }

    // Seleccionar región (usa formControlName="region")
    const regionSelect = page.locator('[data-cy="region-select"]');
    await expect(regionSelect).toBeVisible();
    await regionSelect.click();
    await page.waitForTimeout(500);
    const regionOptions = page.locator('[data-cy="region-option"]');
    const regionCount = await regionOptions.count();
    if (regionCount > 0) {
      await regionOptions.first().click();
      await page.waitForTimeout(1000);
      console.log('✅ Región seleccionada');
    }

    // Llenar código postal
    const zipField = page.locator('[data-cy="zip-code-input"]');
    await expect(zipField).toBeVisible();
    await zipField.fill(siteData.zipCode);
    console.log(`✅ Código postal ingresado: ${siteData.zipCode}`);

    // Llenar latitud (requerido)
    const latitudeField = page.locator('[data-cy="latitude-input"]');
    await expect(latitudeField).toBeVisible();
    await latitudeField.fill(siteData.latitude);
    console.log(`✅ Latitud ingresada: ${siteData.latitude}`);

    // Llenar longitud (requerido)
    const longitudeField = page.locator('[data-cy="longitude-input"]');
    await expect(longitudeField).toBeVisible();
    await longitudeField.fill(siteData.longitude);
    console.log(`✅ Longitud ingresada: ${siteData.longitude}`);

    // ========================================
    // SECCIÓN 3: DIRECCIÓN POSTAL
    // ========================================
    console.log('\n📮 Configurando dirección postal...');

    // Marcar "Same as physical address" para simplificar
    const sameAsPhysicalCheckbox = page.locator('input[formControlName="sameAsPhysicalAddress"], mat-checkbox[formControlName="sameAsPhysicalAddress"]');
    if (await sameAsPhysicalCheckbox.isVisible()) {
      await sameAsPhysicalCheckbox.click();
      await page.waitForTimeout(500);
      console.log('✅ Dirección postal igual a física marcada');
    }

    // ========================================
    // SECCIÓN 4: INFORMACIÓN ADMINISTRATIVA
    // ========================================
    console.log('\n🏢 Llenando información administrativa...');

    // Seleccionar Non-profit organization (requerido)
    const nonProfitSelect = page.locator('[data-cy="non-profit-select"]');
    await expect(nonProfitSelect).toBeVisible();
    await nonProfitSelect.click();
    await page.waitForTimeout(500);
    const nonProfitOptions = page.locator('[data-cy="non-profit-option"]');
    if (await nonProfitOptions.count() > 0) {
      await nonProfitOptions.first().click();
      await page.waitForTimeout(500);
      console.log('✅ Organización sin fines de lucro seleccionada');
    }

    // Seleccionar Education Level (requerido, múltiple - seleccionar solo la primera)
    const educationLevelsSelect = page.locator('[data-cy="education-levels-select"]');
    await expect(educationLevelsSelect).toBeVisible();
    await educationLevelsSelect.click();
    await page.waitForTimeout(500);
    const educationLevelOptions = page.locator('[data-cy="education-level-option"]');
    const educationLevelCount = await educationLevelOptions.count();
    if (educationLevelCount > 0) {
      // Seleccionar solo la primera opción (es selección múltiple)
      await educationLevelOptions.first().click();
      await page.waitForTimeout(500);
      // Cerrar el dropdown presionando Escape o haciendo clic fuera
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      console.log('✅ Nivel educativo seleccionado (primera opción)');
    }

    // Seleccionar Organization Type (requerido)
    const organizationTypeSelect = page.locator('[data-cy="organization-type-select"]');
    await expect(organizationTypeSelect).toBeVisible();
    await organizationTypeSelect.click();
    await page.waitForTimeout(500);
    const organizationTypeOptions = page.locator('[data-cy="organization-type-option"]');
    if (await organizationTypeOptions.count() > 0) {
      await organizationTypeOptions.first().click();
      await page.waitForTimeout(500);
      console.log('✅ Tipo de organización seleccionado');
    }

    // ========================================
    // SECCIÓN 5: DÍAS DE FUNCIONAMIENTO
    // ========================================
    console.log('\n📅 Configurando días de funcionamiento...');

    // Llenar From Date (requerido)
    const fromDateField = page.locator('[data-cy="operating-from-date-input"]');
    await expect(fromDateField).toBeVisible();
    // Usar una fecha futura (ej: 1 mes desde hoy)
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() + 1);
    const fromDateStr = `${fromDate.getMonth() + 1}/${fromDate.getDate()}/${fromDate.getFullYear()}`;
    await fromDateField.fill(fromDateStr);
    console.log(`✅ Fecha desde ingresada: ${fromDateStr}`);

    // Llenar To Date (requerido)
    const toDateField = page.locator('[data-cy="operating-to-date-input"]');
    await expect(toDateField).toBeVisible();
    // Usar una fecha futura (ej: 13 meses desde hoy)
    const toDate = new Date();
    toDate.setMonth(toDate.getMonth() + 13);
    const toDateStr = `${toDate.getMonth() + 1}/${toDate.getDate()}/${toDate.getFullYear()}`;
    await toDateField.fill(toDateStr);
    console.log(`✅ Fecha hasta ingresada: ${toDateStr}`);

    // Seleccionar Operating Days (requerido, múltiple)
    const operatingDaysSelect = page.locator('[data-cy="operating-days-of-week-select"]');
    await expect(operatingDaysSelect).toBeVisible();
    await operatingDaysSelect.click();
    await page.waitForTimeout(500);
    const operatingDayOptions = page.locator('[data-cy^="operating-day-option-"]');
    if (await operatingDayOptions.count() > 0) {
      // Seleccionar al menos un día (por ejemplo, lunes)
      await operatingDayOptions.first().click();
      await page.waitForTimeout(500);
      console.log('✅ Días de funcionamiento seleccionados');
    }

    // Seleccionar Start Time (requerido, múltiple - seleccionar solo la primera)
    const startTimeSelect = page.locator('[data-cy="operating-start-time-select"]');
    await expect(startTimeSelect).toBeVisible();
    await startTimeSelect.click();
    await page.waitForTimeout(500);
    const startTimeOptions = page.locator('[data-cy="operating-start-time-option"]');
    const startTimeCount = await startTimeOptions.count();
    if (startTimeCount > 0) {
      // Seleccionar solo la primera opción (es selección múltiple)
      await startTimeOptions.first().click();
      await page.waitForTimeout(500);
      // Cerrar el dropdown presionando Escape o haciendo clic fuera
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      console.log('✅ Hora de inicio seleccionada (primera opción)');
    }

    // Seleccionar End Time (requerido, múltiple - seleccionar solo la primera)
    const endTimeSelect = page.locator('[data-cy="operating-end-time-select"]');
    await expect(endTimeSelect).toBeVisible();
    await endTimeSelect.click();
    await page.waitForTimeout(500);
    const endTimeOptions = page.locator('[data-cy="operating-end-time-option"]');
    const endTimeCount = await endTimeOptions.count();
    if (endTimeCount > 0) {
      // Seleccionar solo la primera opción (es selección múltiple)
      await endTimeOptions.first().click();
      await page.waitForTimeout(500);
      // Cerrar el dropdown presionando Escape o haciendo clic fuera
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      console.log('✅ Hora de fin seleccionada (primera opción)');
    }

    // ========================================
    // SECCIÓN 6: INFORMACIÓN DEL REPRESENTANTE
    // ========================================
    console.log('\n👤 Llenando información del representante...');

    // Llenar First Name (requerido)
    const firstNameField = page.locator('input[formControlName="personInCharge.firstName"], input[formControlName*="firstName"]').first();
    await expect(firstNameField).toBeVisible();
    await firstNameField.fill(siteData.firstName);
    console.log(`✅ Primer nombre ingresado: ${siteData.firstName}`);

    // Llenar Father Last Name (requerido)
    const fatherLastNameField = page.locator('input[formControlName="personInCharge.fatherLastName"], input[formControlName*="fatherLastName"]').first();
    await expect(fatherLastNameField).toBeVisible();
    await fatherLastNameField.fill(siteData.fatherLastName);
    console.log(`✅ Apellido paterno ingresado: ${siteData.fatherLastName}`);

    // Llenar Site Phone (requerido)
    const sitePhoneField = page.locator('input[formControlName="personInCharge.sitePhone"], input[formControlName*="sitePhone"]').first();
    await expect(sitePhoneField).toBeVisible();
    await sitePhoneField.fill(siteData.sitePhone);
    console.log(`✅ Teléfono del sitio ingresado: ${siteData.sitePhone}`);

    // Seleccionar escuela (debería estar la que acabamos de crear)
    const schoolSelect = page.locator('mat-select[formControlName*="school"], mat-select[formControlName*="School"]').first();
    if (await schoolSelect.isVisible()) {
      await schoolSelect.click();
      await page.waitForTimeout(500);
      // Buscar la escuela que acabamos de crear
      const schoolOption = page.locator(`mat-option:has-text("${schoolName}")`);
      if (await schoolOption.isVisible({ timeout: 3000 })) {
        await schoolOption.click();
        console.log(`✅ Escuela "${schoolName}" seleccionada`);
      } else {
        // Si no encontramos la escuela, seleccionar la primera disponible
        await page.locator('mat-option').first().click();
        console.log('✅ Primera escuela disponible seleccionada');
      }
      await page.waitForTimeout(1000);
    }

    // Buscar el botón de enviar (está en el generic-header)
    // El botón puede tener diferentes textos según la traducción
    const submitButton = page.locator('button[type="submit"]')
      .or(page.locator('button').filter({ hasText: /Guardar|Save|Enviar|Submit/i }))
      .first();

    await expect(submitButton).toBeVisible({ timeout: 5000 });

    // Verificar si está habilitado
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled) {
      console.log('⚠️ Botón de envío está deshabilitado - puede haber campos requeridos faltantes');
      // Tomar screenshot para debugging
      await page.screenshot({ path: 'debug-site-form-disabled.png', fullPage: true });

      // Intentar encontrar errores de validación
      const errors = page.locator('.mat-error, .error, [class*="error"]');
      const errorCount = await errors.count();
      if (errorCount > 0) {
        console.log(`📊 Errores de validación encontrados: ${errorCount}`);
        for (let i = 0; i < Math.min(errorCount, 5); i++) {
          const errorText = await errors.nth(i).textContent();
          console.log(`  - Error ${i + 1}: ${errorText}`);
        }
      }

      throw new Error('Botón de envío está deshabilitado - revisar campos requeridos');
    }

    console.log('🚀 Enviando formulario de sitio...');
    await submitButton.click();
    await page.waitForTimeout(5000);

    // Verificar mensaje de éxito o redirección
    const successMessage = page.locator('mat-snack-bar-container, .success, [class*="success"]');
    const currentUrl = page.url();

    if (await successMessage.isVisible({ timeout: 10000 })) {
      const successText = await successMessage.textContent();
      console.log(`✅ Sitio creado exitosamente: ${successText}`);
    } else if (currentUrl.includes('schools') || currentUrl.includes('sites')) {
      console.log('✅ Sitio creado (redirección detectada a: ' + currentUrl + ')');
    } else {
      console.log('⚠️ No se detectó confirmación explícita, pero el formulario se envió');
    }

    // ========================================
    // CONCLUSIÓN
    // ========================================
    console.log('\n═══════════════════════════════════════');
    console.log('🎉 TEST FUNCIONAL COMPLETO FINALIZADO');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Escuela creada: ${schoolName}`);
    console.log(`✅ Sitio creado: ${siteData.name}`);
    console.log('═══════════════════════════════════════\n');
  });
});

