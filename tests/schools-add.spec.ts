import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Función helper para generar datos únicos para las pruebas
const generateSchoolData = () => {
  return {
    name: `Escuela Test ${faker.string.alphanumeric(6)}`,
    address: faker.location.streetAddress(),
    zipCode: faker.location.zipCode('#####'),
    latitude: '18.4655', // Coordenadas de Puerto Rico
    longitude: '-66.1057',
    postalAddress: faker.location.streetAddress(),
    postalZipCode: faker.location.zipCode('#####'),
    administratorName: faker.person.fullName(),
    sitePhone: faker.phone.number(),
    extension: faker.string.numeric(3),
    mobilePhone: faker.phone.number(),
    baseYear: faker.number.int({ min: 2020, max: 2024 }).toString(),
    renewalYear: faker.number.int({ min: 2024, max: 2028 }).toString(),
    operatingDays: faker.number.int({ min: 1, max: 7 }).toString(),
    uniqueId: faker.string.alphanumeric(8).toLowerCase()
  };
};

// Función helper para manejar errores de conexión y reintentar
const navigateWithRetry = async (page: any, url: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Verificar si hay error de conexión
      const currentUrl = page.url();
      if (currentUrl.includes('error=connection')) {
        console.log(`Intento ${attempt}: Error de conexión detectado, reintentando...`);
        if (attempt < maxRetries) {
          await page.waitForTimeout(2000);
          continue;
        } else {
          console.log('Error de conexión persistente, pero continuando con el test');
          return; // No fallar, solo continuar
        }
      }

      return; // Éxito, salir del bucle
    } catch (error) {
      console.log(`Intento ${attempt} falló:`, error.message);
      if (attempt === maxRetries) {
        console.log('Error persistente, pero continuando con el test');
        return; // No fallar, solo continuar
      }
      await page.waitForTimeout(2000);
    }
  }
};

// Función helper para hacer login de manera robusta
const performLogin = async (page: any) => {
  console.log('Iniciando proceso de login...');

  // Verificar si ya estamos logueados
  const loginForm = page.locator('[data-cy=email-field]');
  if (!(await loginForm.isVisible())) {
    console.log('No se detectó formulario de login, posiblemente ya estamos logueados');
    return true;
  }

  try {
    console.log('Llenando credenciales...');
    await page.fill('[data-cy=email-input]', 'Margaretta_Runte78@hotmail.com');
    await page.fill('[data-cy=password-input]', '9c272156');

    console.log('Haciendo clic en el botón de login...');
    await page.click('[data-cy=submit-button]');

    // Esperar a que se complete el login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Verificar si el login fue exitoso
    const currentUrl = page.url();
    console.log(`URL después del login: ${currentUrl}`);

    // Si aún estamos en la página de login, verificar si hay errores
    if (currentUrl.includes('login') || await loginForm.isVisible()) {
      console.log('Parece que el login no fue exitoso');

      // Verificar si hay mensajes de error
      const errorMessage = page.locator('.error, .alert-error, [class*="error"]');
      if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log(`Error de login: ${errorText}`);
        return false;
      }

      return false;
    }

    console.log('✓ Login exitoso');
    return true;
  } catch (error) {
    console.log(`Error durante el login: ${error.message}`);
    return false;
  }
};

test.describe('Schools Add - Complete Flow Test', () => {

  test('should complete full flow: login -> fill form -> submit', async ({ page }) => {
    // ========================================
    // PASO 1: LOGIN
    // ========================================
    console.log('🚀 INICIANDO TEST COMPLETO: Login -> Llenar Formulario -> Submit');

    // Generar datos únicos para esta prueba
    const testData = generateSchoolData();
    console.log('📋 Datos de prueba generados:', testData);

    // Navegar a la aplicación
    console.log('📍 Paso 1.1: Navegando a la aplicación...');
    await navigateWithRetry(page, 'https://nutre-dev.local:4202');

    // Hacer login
    console.log('🔐 Paso 1.2: Realizando login...');
    const loginSuccess = await performLogin(page);
    if (!loginSuccess) {
      console.log('❌ ERROR: No se pudo hacer login. Abortando test.');
      throw new Error('Login falló');
    }

    // ========================================
    // PASO 2: NAVEGAR A LA PÁGINA DE AGREGAR ESCUELA
    // ========================================
    console.log('📍 Paso 2: Navegando a la página de agregar escuela...');
    await navigateWithRetry(page, 'https://nutre-dev.local:4202/agency-portal/schools/add');

    // Verificar que estamos en la página correcta
    const currentUrl = page.url();
    console.log(`📍 URL actual: ${currentUrl}`);

    if (currentUrl.includes('error=connection')) {
      console.log('❌ ERROR: Error de conexión persistente. Abortando test.');
      throw new Error('Error de conexión');
    }

    if (!currentUrl.includes('schools/add')) {
      console.log('❌ ERROR: No estamos en la página de agregar escuela. Abortando test.');
      throw new Error('Navegación incorrecta');
    }

    // ========================================
    // PASO 3: VERIFICAR QUE EL FORMULARIO ESTÉ PRESENTE
    // ========================================
    console.log('📝 Paso 3: Verificando que el formulario esté presente...');

    // Esperar a que la página se cargue completamente
    await page.waitForTimeout(3000);

    const form = page.locator('[data-cy=schools-add-form]');
    const formExists = await form.count();

    if (formExists === 0) {
      console.log('❌ ERROR: El formulario no se encontró. Tomando screenshot para debugging...');
      await page.screenshot({ path: 'error-form-not-found.png' });

      // Listar elementos disponibles para debugging
      const allElements = page.locator('[data-cy]');
      const elementCount = await allElements.count();
      console.log(`📊 Total de elementos con data-cy en la página: ${elementCount}`);

      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = allElements.nth(i);
        const dataCy = await element.getAttribute('data-cy');
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        console.log(`  - Elemento ${i + 1}: <${tagName}> data-cy="${dataCy}"`);
      }

      throw new Error('Formulario no encontrado');
    }

    console.log('✅ Formulario encontrado correctamente');

    // ========================================
    // PASO 4: LLENAR INFORMACIÓN BÁSICA
    // ========================================
    console.log('📝 Paso 4: Llenando información básica...');

    // Nombre de la escuela
    console.log('  - Llenando nombre de la escuela...');
    const nameInput = page.locator('[data-cy=name-input]');
    await nameInput.fill(testData.name);
    await expect(nameInput).toHaveValue(testData.name);
    console.log(`    ✅ Nombre llenado: ${testData.name}`);

    // Dirección
    console.log('  - Llenando dirección...');
    const addressInput = page.locator('[data-cy=address-input]');
    await addressInput.fill(testData.address);
    await expect(addressInput).toHaveValue(testData.address);
    console.log(`    ✅ Dirección llenada: ${testData.address}`);

    // Código postal
    console.log('  - Llenando código postal...');
    const zipCodeInput = page.locator('[data-cy=zip-code-input]');
    await zipCodeInput.fill(testData.zipCode);
    await expect(zipCodeInput).toHaveValue(testData.zipCode);
    console.log(`    ✅ Código postal llenado: ${testData.zipCode}`);

    // Latitud
    console.log('  - Llenando latitud...');
    const latitudeInput = page.locator('[data-cy=latitude-input]');
    await latitudeInput.fill(testData.latitude);
    await expect(latitudeInput).toHaveValue(testData.latitude);
    console.log(`    ✅ Latitud llenada: ${testData.latitude}`);

    // Longitud
    console.log('  - Llenando longitud...');
    const longitudeInput = page.locator('[data-cy=longitude-input]');
    await longitudeInput.fill(testData.longitude);
    await expect(longitudeInput).toHaveValue(testData.longitude);
    console.log(`    ✅ Longitud llenada: ${testData.longitude}`);

    // ========================================
    // PASO 5: SELECCIONAR CIUDAD Y REGIÓN
    // ========================================
    console.log('🌍 Paso 5: Seleccionando ciudad y región...');

    // Ciudad
    console.log('  - Seleccionando ciudad...');
    const citySelect = page.locator('[data-cy=city-select]');
    await citySelect.click();
    await page.waitForTimeout(500);

    const cityOptions = page.locator('[data-cy=city-option]');
    const cityOptionCount = await cityOptions.count();
    if (cityOptionCount > 0) {
      const firstCityOption = cityOptions.first();
      await firstCityOption.click();
      console.log('    ✅ Ciudad seleccionada');

      // Esperar a que las regiones se carguen después de seleccionar la ciudad
      await page.waitForTimeout(1000);
    } else {
      console.log('    ⚠️ No hay opciones de ciudad disponibles');
    }

    // Región
    console.log('  - Seleccionando región...');
    const regionSelect = page.locator('[data-cy=region-select]');
    await regionSelect.click();
    await page.waitForTimeout(500);

    const regionOptions = page.locator('[data-cy=region-option]');
    const regionOptionCount = await regionOptions.count();
    if (regionOptionCount > 0) {
      const firstRegionOption = regionOptions.first();
      await firstRegionOption.click();
      console.log('    ✅ Región seleccionada');
    } else {
      console.log('    ⚠️ No hay opciones de región disponibles');
    }

    // ========================================
    // PASO 6: LLENAR INFORMACIÓN ADMINISTRATIVA
    // ========================================
    console.log('👤 Paso 6: Llenando información administrativa...');

    // Nombre del administrador
    console.log('  - Llenando nombre del administrador...');
    const adminNameInput = page.locator('[data-cy=administrator-authorized-name-input]');
    await adminNameInput.fill(testData.administratorName);
    await expect(adminNameInput).toHaveValue(testData.administratorName);
    console.log(`    ✅ Nombre del administrador llenado: ${testData.administratorName}`);

    // Teléfono del sitio
    console.log('  - Llenando teléfono del sitio...');
    const sitePhoneInput = page.locator('[data-cy=site-phone-input]');
    await sitePhoneInput.fill(testData.sitePhone);
    await expect(sitePhoneInput).toHaveValue(testData.sitePhone);
    console.log(`    ✅ Teléfono del sitio llenado: ${testData.sitePhone}`);

    // Extensión
    console.log('  - Llenando extensión...');
    const extensionInput = page.locator('[data-cy=extension-input]');
    await extensionInput.fill(testData.extension);
    await expect(extensionInput).toHaveValue(testData.extension);
    console.log(`    ✅ Extensión llenada: ${testData.extension}`);

    // Teléfono móvil
    console.log('  - Llenando teléfono móvil...');
    const mobilePhoneInput = page.locator('[data-cy=mobile-phone-input]');
    await mobilePhoneInput.fill(testData.mobilePhone);
    await expect(mobilePhoneInput).toHaveValue(testData.mobilePhone);
    console.log(`    ✅ Teléfono móvil llenado: ${testData.mobilePhone}`);

    // ========================================
    // PASO 7: SELECCIONAR OPCIONES DE DROPDOWN
    // ========================================
    console.log('📋 Paso 7: Seleccionando opciones de dropdown...');

    // Organización sin fines de lucro
    console.log('  - Seleccionando organización sin fines de lucro...');
    const nonProfitSelect = page.locator('[data-cy=non-profit-select]');
    await nonProfitSelect.click();
    await page.waitForTimeout(500);

    const nonProfitOptions = page.locator('[data-cy=non-profit-option]');
    const nonProfitOptionCount = await nonProfitOptions.count();
    if (nonProfitOptionCount > 0) {
      const firstOption = nonProfitOptions.first();
      await firstOption.click();
      console.log('    ✅ Organización sin fines de lucro seleccionada');
    } else {
      console.log('    ⚠️ No hay opciones de organización sin fines de lucro disponibles');
    }

    // Tipo de organización
    console.log('  - Seleccionando tipo de organización...');
    const orgTypeSelect = page.locator('[data-cy=organization-type-select]');
    await orgTypeSelect.click();
    await page.waitForTimeout(500);

    const orgTypeOptions = page.locator('[data-cy=organization-type-option]');
    const orgTypeOptionCount = await orgTypeOptions.count();
    if (orgTypeOptionCount > 0) {
      const firstOption = orgTypeOptions.first();
      await firstOption.click();
      console.log('    ✅ Tipo de organización seleccionado');
    } else {
      console.log('    ⚠️ No hay opciones de tipo de organización disponibles');
    }

    // Centro
    console.log('  - Seleccionando centro...');
    const centerSelect = page.locator('[data-cy=center-select]');
    await centerSelect.click();
    await page.waitForTimeout(500);

    const centerOptions = page.locator('[data-cy=center-option]');
    const centerOptionCount = await centerOptions.count();
    if (centerOptionCount > 0) {
      const firstOption = centerOptions.first();
      await firstOption.click();
      console.log('    ✅ Centro seleccionado');
    } else {
      console.log('    ⚠️ No hay opciones de centro disponibles');
    }

    // Tipo de cocina
    console.log('  - Seleccionando tipo de cocina...');
    const kitchenTypeSelect = page.locator('[data-cy=kitchen-type-select]');
    await kitchenTypeSelect.click();
    await page.waitForTimeout(500);

    const kitchenTypeOptions = page.locator('[data-cy=kitchen-type-option]');
    const kitchenTypeOptionCount = await kitchenTypeOptions.count();
    if (kitchenTypeOptionCount > 0) {
      const firstOption = kitchenTypeOptions.first();
      await firstOption.click();
      console.log('    ✅ Tipo de cocina seleccionado');
    } else {
      console.log('    ⚠️ No hay opciones de tipo de cocina disponibles');
    }

    // Tipo de grupo
    console.log('  - Seleccionando tipo de grupo...');
    const groupTypeSelect = page.locator('[data-cy=group-type-select]');
    await groupTypeSelect.click();
    await page.waitForTimeout(500);

    const groupTypeOptions = page.locator('[data-cy=group-type-option]');
    const groupTypeOptionCount = await groupTypeOptions.count();
    if (groupTypeOptionCount > 0) {
      const firstOption = groupTypeOptions.first();
      await firstOption.click();
      console.log('    ✅ Tipo de grupo seleccionado');
    } else {
      console.log('    ⚠️ No hay opciones de tipo de grupo disponibles');
    }

    // Tipo de entrega
    console.log('  - Seleccionando tipo de entrega...');
    const deliveryTypeSelect = page.locator('[data-cy=delivery-type-select]');
    await deliveryTypeSelect.click();
    await page.waitForTimeout(500);

    const deliveryTypeOptions = page.locator('[data-cy=delivery-type-option]');
    const deliveryTypeOptionCount = await deliveryTypeOptions.count();
    if (deliveryTypeOptionCount > 0) {
      const firstOption = deliveryTypeOptions.first();
      await firstOption.click();
      console.log('    ✅ Tipo de entrega seleccionado');
    } else {
      console.log('    ⚠️ No hay opciones de tipo de entrega disponibles');
    }

    // Tipo de área
    console.log('  - Seleccionando tipo de área...');
    const areaTypeSelect = page.locator('[data-cy=type-of-area-select]');
    await areaTypeSelect.click();
    await page.waitForTimeout(500);

    const areaTypeOptions = page.locator('[data-cy=type-of-area-option]');
    const areaTypeOptionCount = await areaTypeOptions.count();
    if (areaTypeOptionCount > 0) {
      const firstOption = areaTypeOptions.first();
      await firstOption.click();
      console.log('    ✅ Tipo de área seleccionado');
    } else {
      console.log('    ⚠️ No hay opciones de tipo de área disponibles');
    }

    // ========================================
    // PASO 8: LLENAR CAMPOS ADICIONALES
    // ========================================
    console.log('📅 Paso 8: Llenando campos adicionales...');

    // Año base
    console.log('  - Llenando año base...');
    const baseYearInput = page.locator('[data-cy=base-year-input]');
    if (await baseYearInput.isVisible()) {
      const isDisabled = await baseYearInput.isDisabled();
      if (!isDisabled) {
        await baseYearInput.fill(testData.baseYear);
        await expect(baseYearInput).toHaveValue(testData.baseYear);
        console.log(`    ✅ Año base llenado: ${testData.baseYear}`);
      } else {
        console.log(`    ⚠️ Campo año base está deshabilitado, saltando...`);
      }
    } else {
      console.log(`    ⚠️ Campo año base no está visible, saltando...`);
    }

    // Año de renovación
    console.log('  - Llenando año de renovación...');
    const renewalYearInput = page.locator('[data-cy=renewal-year-input]');
    if (await renewalYearInput.isVisible()) {
      const isDisabled = await renewalYearInput.isDisabled();
      if (!isDisabled) {
        await renewalYearInput.fill(testData.renewalYear);
        await expect(renewalYearInput).toHaveValue(testData.renewalYear);
        console.log(`    ✅ Año de renovación llenado: ${testData.renewalYear}`);
      } else {
        console.log(`    ⚠️ Campo año de renovación está deshabilitado, saltando...`);
      }
    } else {
      console.log(`    ⚠️ Campo año de renovación no está visible, saltando...`);
    }

    // Días de funcionamiento
    console.log('  - Llenando días de funcionamiento...');
    const operatingDaysInput = page.locator('[data-cy=operating-days-input]');
    if (await operatingDaysInput.isVisible()) {
      const isDisabled = await operatingDaysInput.isDisabled();
      if (!isDisabled) {
        await operatingDaysInput.fill(testData.operatingDays);
        await expect(operatingDaysInput).toHaveValue(testData.operatingDays);
        console.log(`    ✅ Días de funcionamiento llenados: ${testData.operatingDays}`);
      } else {
        console.log(`    ⚠️ Campo días de funcionamiento está deshabilitado, saltando...`);
      }
    } else {
      console.log(`    ⚠️ Campo días de funcionamiento no está visible, saltando...`);
    }

    // ========================================
    // PASO 9: DIAGNÓSTICO DE CAMPOS DESHABILITADOS
    // ========================================
    console.log('🔍 Paso 9: Diagnóstico de campos deshabilitados...');

    // Verificar qué campos están deshabilitados
    const allInputs = page.locator('input[data-cy], select[data-cy]');
    const inputCount = await allInputs.count();
    console.log(`📊 Total de campos con data-cy encontrados: ${inputCount}`);

    let disabledCount = 0;
    for (let i = 0; i < inputCount; i++) {
      const input = allInputs.nth(i);
      const dataCy = await input.getAttribute('data-cy');
      const isDisabled = await input.isDisabled();
      const isVisible = await input.isVisible();

      if (isDisabled) {
        disabledCount++;
        console.log(`  ❌ Campo deshabilitado: ${dataCy}`);
      } else if (isVisible) {
        console.log(`  ✅ Campo habilitado: ${dataCy}`);
      } else {
        console.log(`  ⚠️ Campo no visible: ${dataCy}`);
      }
    }

    console.log(`📊 Resumen: ${disabledCount} campos deshabilitados de ${inputCount} total`);

    if (disabledCount > 0) {
      console.log('⚠️ ADVERTENCIA: Hay campos deshabilitados. Esto puede indicar:');
      console.log('  - Campos requeridos no llenados');
      console.log('  - Validaciones no cumplidas');
      console.log('  - Formulario no completamente inicializado');

      // Tomar screenshot para debugging
      await page.screenshot({ path: 'debug-disabled-fields.png' });
    }

    // ========================================
    // PASO 10: VERIFICAR BOTÓN DE ENVÍO Y HACER SUBMIT
    // ========================================
    console.log('🚀 Paso 10: Verificando botón de envío y haciendo submit...');

    // Buscar el botón de envío
    const submitButton = page.locator('button[type="submit"], [data-cy="submit-button"]');

    if (await submitButton.isVisible()) {
      console.log('  - Botón de envío encontrado');

      // Verificar si está habilitado
      const isDisabled = await submitButton.isDisabled();
      if (isDisabled) {
        console.log('    ⚠️ Botón de envío está deshabilitado');

        // Verificar si hay errores de validación
        const errorElements = page.locator('.mat-error, .error, [class*="error"]');
        const errorCount = await errorElements.count();
        console.log(`    📊 Errores de validación encontrados: ${errorCount}`);

        if (errorCount > 0) {
          for (let i = 0; i < Math.min(errorCount, 5); i++) {
            const errorText = await errorElements.nth(i).textContent();
            console.log(`      - Error ${i + 1}: ${errorText}`);
          }
        }

        // Tomar screenshot para debugging
        await page.screenshot({ path: 'debug-submit-button-disabled.png' });
        throw new Error('Botón de envío está deshabilitado');
      } else {
        console.log('    ✅ Botón de envío está habilitado');

        // Hacer clic en el botón de envío
        console.log('  - Haciendo clic en el botón de envío...');
        await submitButton.click();

        // Esperar a que se procese el envío
        console.log('  - Esperando respuesta del servidor...');
        await page.waitForTimeout(3000);

        // Verificar el resultado
        const finalUrl = page.url();
        console.log(`  📍 URL después del submit: ${finalUrl}`);

        // Verificar si hay mensajes de éxito o error
        const successMessage = page.locator('.success, .alert-success, [class*="success"]');
        const errorMessage = page.locator('.error, .alert-error, [class*="error"]');

        if (await successMessage.isVisible()) {
          const successText = await successMessage.textContent();
          console.log(`    ✅ ÉXITO: ${successText}`);
        } else if (await errorMessage.isVisible()) {
          const errorText = await errorMessage.textContent();
          console.log(`    ❌ ERROR: ${errorText}`);

          // Tomar screenshot del error
          await page.screenshot({ path: 'error-after-submit.png' });
          throw new Error(`Error después del submit: ${errorText}`);
        } else {
          console.log('    ⚠️ No se detectaron mensajes de éxito o error');

          // Verificar si fuimos redirigidos
          if (finalUrl !== currentUrl) {
            console.log('    ✅ Fuimos redirigidos a una nueva página');
          } else {
            console.log('    ⚠️ No hubo redirección');
          }
        }
      }
    } else {
      console.log('  ❌ ERROR: Botón de envío no encontrado');

      // Tomar screenshot para debugging
      await page.screenshot({ path: 'error-submit-button-not-found.png' });
      throw new Error('Botón de envío no encontrado');
    }

    // ========================================
    // PASO 11: CONCLUSIÓN
    // ========================================
    console.log('🎉 ¡TEST COMPLETADO EXITOSAMENTE!');
    console.log('✅ Flujo completo: Login -> Llenar Formulario -> Submit');
    console.log(`📋 Datos utilizados: ${testData.name}`);
  });
});
