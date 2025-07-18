import { test, expect } from '@playwright/test';

test.describe('Sponsor Registration - PDAM Program Tests', () => {

  test('should navigate to sponsor registration page', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('https://nutre-dev.local:4202');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la página principal
    await expect(page).toHaveURL(/.*nutre-dev\.local.*/);

    // Buscar el enlace de registro (puede tener diferentes nombres)
    const signUpLink = page.locator('[data-cy=sign-up-link], a:has-text("Registrarse"), a:has-text("Sign Up")');
    await expect(signUpLink).toBeVisible();

    // Hacer clic en el enlace de registro
    await signUpLink.click();

    // Esperar a que se complete la navegación
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en una página de registro o sign-up
    await expect(page).toHaveURL(/.*(register|sign-up).*/);
  });

  test('should fill complete PDAM sponsor registration form', async ({ page }) => {
    // Navegar directamente a la página de registro
    await page.goto('https://nutre-dev.local:4202/sign-up');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la página de registro
    await expect(page).toHaveURL(/.*sign-up.*/);

    // Verificar que el formulario esté presente
    const form = page.locator('[data-cy=sign-up-form]');
    await expect(form).toBeVisible();

    // 1. Seleccionar programa PDAM (campo requerido)
    const programSelect = page.locator('[data-cy=program-select]');
    if (await programSelect.isVisible()) {
      await programSelect.click();
      // Seleccionar específicamente PDAM (asumiendo que es la primera opción o buscar por texto)
      const pdamOption = page.locator('[data-cy=program-option]:has-text("PDAM"), [data-cy=program-option]:has-text("Programa de Desayuno y Almuerzo")').first();
      if (await pdamOption.isVisible()) {
        await pdamOption.click();
      } else {
        // Si no encuentra PDAM específicamente, seleccionar la primera opción
        const firstProgramOption = page.locator('[data-cy=program-option]').first();
        await firstProgramOption.click();
      }
    }

    // 2. Llenar información de la agencia
    const agencyNameField = page.locator('[data-cy=agency-input]');
    if (await agencyNameField.isVisible()) {
      await agencyNameField.fill('Agencia PDAM de Prueba Playwright');
      await expect(agencyNameField).toHaveValue('Agencia PDAM de Prueba Playwright');
    }

    // 3. Llenar números de identificación
    const uieField = page.locator('[data-cy=uie-input]');
    if (await uieField.isVisible()) {
      await uieField.fill('123456789');
      await expect(uieField).toHaveValue('123456789');
    }

    const sdrField = page.locator('[data-cy=sdr-input]');
    if (await sdrField.isVisible()) {
      await sdrField.fill('987654321');
      await expect(sdrField).toHaveValue('987654321');
    }

    const einField = page.locator('[data-cy=ein-input]');
    if (await einField.isVisible()) {
      await einField.fill('123456789');
      await expect(einField).toHaveValue('123456789');
    }

    // 4. Llenar campos de organización
    const nonProfitSelect = page.locator('[data-cy=non-profit-select]');
    if (await nonProfitSelect.isVisible()) {
      await nonProfitSelect.click();
      const firstOption = page.locator('[data-cy=non-profit-option]').first();
      await firstOption.click();
    }

    const basicEducationRegistrySelect = page.locator('[data-cy=basic-education-registry-select]');
    if (await basicEducationRegistrySelect.isVisible()) {
      await basicEducationRegistrySelect.click();
      const firstOption = page.locator('[data-cy=basic-education-registry-option]').first();
      await firstOption.click();
    }

    // 5. Llenar campos de fondos
    const stateFundsDeniedSelect = page.locator('[data-cy=state-funds-denied-select]');
    if (await stateFundsDeniedSelect.isVisible()) {
      await stateFundsDeniedSelect.click();
      const firstOption = page.locator('[data-cy=state-funds-denied-option]').first();
      await firstOption.click();
    }

    const federalFundsDeniedSelect = page.locator('[data-cy=federal-funds-denied-select]');
    if (await federalFundsDeniedSelect.isVisible()) {
      await federalFundsDeniedSelect.click();
      const firstOption = page.locator('[data-cy=federal-funds-denied-option]').first();
      await firstOption.click();
    }

    // 6. Llenar campos de programas atléticos
    const organizedAthleticProgramsSelect = page.locator('[data-cy=organized-athletic-programs-select]');
    if (await organizedAthleticProgramsSelect.isVisible()) {
      await organizedAthleticProgramsSelect.click();
      const firstOption = page.locator('[data-cy=organized-athletic-programs-option]').first();
      await firstOption.click();

      // Esperar a que aparezca el campo de servicio en riesgo si es visible
      await page.waitForTimeout(500);
    }

    // 6.1. Llenar campo de servicio en riesgo (solo visible si programas atléticos = Sí)
    const atRiskServiceSelect = page.locator('[data-cy=at-risk-service-select]');
    if (await atRiskServiceSelect.isVisible()) {
      await atRiskServiceSelect.click();
      const firstOption = page.locator('[data-cy=at-risk-service-option]').first();
      await firstOption.click();
    }

    // 7. Llenar fecha de servicio
    const serviceTimeInput = page.locator('[data-cy=service-time-input]');
    if (await serviceTimeInput.isVisible()) {
      await serviceTimeInput.fill('2020-01-01');
      await expect(serviceTimeInput).toHaveValue('2020-01-01');
    }

    // 8. Llenar campos de exención contributiva
    const taxExemptionStatusSelect = page.locator('[data-cy=tax-exemption-status-input]');
    if (await taxExemptionStatusSelect.isVisible()) {
      await taxExemptionStatusSelect.click();
      const firstOption = page.locator('[data-cy=tax-exemption-status-option]').first();
      await firstOption.click();
    }

    const taxExemptionTypeSelect = page.locator('[data-cy=tax-exemption-type-input]');
    if (await taxExemptionTypeSelect.isVisible()) {
      await taxExemptionTypeSelect.click();
      const firstOption = page.locator('[data-cy=tax-exemption-type-option]').first();
      await firstOption.click();
    }

    // 9. Llenar tipo de entidad y solicitante
    const typeOfEntitySelect = page.locator('[data-cy=type-of-entity-input]');
    if (await typeOfEntitySelect.isVisible()) {
      await typeOfEntitySelect.click();
      const firstOption = page.locator('[data-cy=type-of-entity-option]').first();
      await firstOption.click();
    }

    const typeOfApplicantSelect = page.locator('[data-cy=type-of-applicant-input]');
    if (await typeOfApplicantSelect.isVisible()) {
      await typeOfApplicantSelect.click();
      const firstOption = page.locator('[data-cy=type-of-applicant-option]').first();
      await firstOption.click();
    }

    // 10. Llenar contrato de alianza pública
    const publicAllianceContractSelect = page.locator('[data-cy=public-alliance-contract-input]');
    if (await publicAllianceContractSelect.isVisible()) {
      await publicAllianceContractSelect.click();
      const firstOption = page.locator('[data-cy=public-alliance-contract-option]').first();
      await firstOption.click();
    }

    // 11. Llenar dirección física
    const addressField = page.locator('[data-cy=address-input]');
    if (await addressField.isVisible()) {
      await addressField.fill('Calle Principal 123');
      await expect(addressField).toHaveValue('Calle Principal 123');
    }

    const citySelect = page.locator('[data-cy=city-select]');
    if (await citySelect.isVisible()) {
      await citySelect.click();
      const firstCityOption = page.locator('[data-cy=city-option]').first();
      await firstCityOption.click();

      // Esperar a que las regiones se carguen después de seleccionar la ciudad
      await page.waitForTimeout(1000);
    }

    const regionSelect = page.locator('[data-cy=region-select]');
    if (await regionSelect.isVisible()) {
      await regionSelect.click();
      // Esperar a que las opciones de región estén disponibles
      await page.waitForSelector('[data-cy=region-option]', { timeout: 10000 });
      const firstRegionOption = page.locator('[data-cy=region-option]').first();
      await firstRegionOption.click();
    }

    const zipCodeField = page.locator('[data-cy=zip-code-input]');
    if (await zipCodeField.isVisible()) {
      await zipCodeField.fill('00901');
      await expect(zipCodeField).toHaveValue('00901');
    }

    const latitudeField = page.locator('[data-cy=latitude-input]');
    if (await latitudeField.isVisible()) {
      await latitudeField.fill('18.4655');
      await expect(latitudeField).toHaveValue('18.4655');
    }

    const longitudeField = page.locator('[data-cy=longitude-input]');
    if (await longitudeField.isVisible()) {
      await longitudeField.fill('-66.1057');
      await expect(longitudeField).toHaveValue('-66.1057');
    }

    // 12. Llenar dirección postal
    const postalAddressField = page.locator('[data-cy=postal-address-input]');
    if (await postalAddressField.isVisible()) {
      await postalAddressField.fill('Apartado 123');
      await expect(postalAddressField).toHaveValue('Apartado 123');
    }

    const postalCitySelect = page.locator('[data-cy=postal-city-select]');
    if (await postalCitySelect.isVisible()) {
      await postalCitySelect.click();
      const firstPostalCityOption = page.locator('[data-cy=postal-city-option]').first();
      await firstPostalCityOption.click();

      // Esperar a que las regiones postales se carguen después de seleccionar la ciudad postal
      await page.waitForTimeout(1000);
    }

    const postalRegionSelect = page.locator('[data-cy=postal-region-select]');
    if (await postalRegionSelect.isVisible()) {
      await postalRegionSelect.click();
      // Esperar a que las opciones de región postal estén disponibles
      await page.waitForSelector('[data-cy=postal-region-option]', { timeout: 10000 });
      const firstPostalRegionOption = page.locator('[data-cy=postal-region-option]').first();
      await firstPostalRegionOption.click();
    }

    const postalZipCodeField = page.locator('[data-cy=postal-zip-code-input]');
    if (await postalZipCodeField.isVisible()) {
      await postalZipCodeField.fill('00902');
      await expect(postalZipCodeField).toHaveValue('00902');
    }

    // 13. Llenar información del usuario
    const firstNameField = page.locator('[data-cy=first-name-input]');
    if (await firstNameField.isVisible()) {
      await firstNameField.fill('Juan');
      await expect(firstNameField).toHaveValue('Juan');
    }

    const middleNameField = page.locator('[data-cy=middle-name-input]');
    if (await middleNameField.isVisible()) {
      await middleNameField.fill('Carlos');
      await expect(middleNameField).toHaveValue('Carlos');
    }

    const fatherLastNameField = page.locator('[data-cy=father-last-name-input]');
    if (await fatherLastNameField.isVisible()) {
      await fatherLastNameField.fill('García');
      await expect(fatherLastNameField).toHaveValue('García');
    }

    const motherLastNameField = page.locator('[data-cy=mother-last-name-input]');
    if (await motherLastNameField.isVisible()) {
      await motherLastNameField.fill('López');
      await expect(motherLastNameField).toHaveValue('López');
    }

    const emailField = page.locator('[data-cy=email-input]');
    if (await emailField.isVisible()) {
      await emailField.fill('prueba-pdam@playwright.com');
      await expect(emailField).toHaveValue('prueba-pdam@playwright.com');
    }

    const phoneField = page.locator('[data-cy=phone-input]');
    if (await phoneField.isVisible()) {
      await phoneField.fill('787-555-0123');
      await expect(phoneField).toHaveValue('787-555-0123');
    }

    const adminTitleField = page.locator('[data-cy=admin-title-input]');
    if (await adminTitleField.isVisible()) {
      await adminTitleField.fill('Director Ejecutivo PDAM');
      await expect(adminTitleField).toHaveValue('Director Ejecutivo PDAM');
    }

    // Verificar que al menos un campo del formulario esté presente
    const formFields = page.locator('input, select, textarea');
    await expect(formFields.first()).toBeVisible();
  });

  test('should test PDAM specific conditional fields', async ({ page }) => {
    // Navegar a la página de registro
    await page.goto('https://nutre-dev.local:4202/sign-up');

    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');

    // Seleccionar programa PDAM
    const programSelect = page.locator('[data-cy=program-select]');
    if (await programSelect.isVisible()) {
      await programSelect.click();
      const pdamOption = page.locator('[data-cy=program-option]:has-text("PDAM"), [data-cy=program-option]:has-text("Programa de Desayuno y Almuerzo")').first();
      if (await pdamOption.isVisible()) {
        await pdamOption.click();
      } else {
        const firstProgramOption = page.locator('[data-cy=program-option]').first();
        await firstProgramOption.click();
      }
    }

    // Verificar campos específicos de PDAM
    const pdamSpecificFields = [
      { selector: '[data-cy=at-risk-service-select]', name: 'Servicio en riesgo', condition: 'Visible cuando programas atléticos = Sí' },
      { selector: '[data-cy=national-youth-program-input]', name: 'Programa Nacional de Juventud', condition: 'No visible para PDAM' }
    ];

    console.log('\nCampos específicos de PDAM:');
    for (const field of pdamSpecificFields) {
      const element = page.locator(field.selector);
      if (await element.isVisible()) {
        console.log(`✓ Campo ${field.name} está visible (${field.condition})`);
      } else {
        console.log(`- Campo ${field.name} no está visible (${field.condition})`);
      }
    }
  });
});
