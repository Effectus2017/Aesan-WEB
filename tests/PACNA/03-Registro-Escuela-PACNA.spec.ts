import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

test.describe('PACNA - School Registration Flow', () => {

  test('03 - Successful School Registration for All Scenarios', async ({ page }) => {
    // 1. Load login data (current credentials)
    const loginPath = path.join(__dirname, '02-Login-PACNA.json');
    if (!fs.existsSync(loginPath)) {
        console.log('02-Login-PACNA.json not found. Skipping.');
        return;
    }
    const loginScenarios = JSON.parse(fs.readFileSync(loginPath, 'utf8'));

    // 2. Load school templates
    const schoolPath = path.join(__dirname, '03-Registro-Escuela-PACNA.json');
    if (!fs.existsSync(schoolPath)) {
        console.log('03-Registro-Escuela-PACNA.json not found. Skipping.');
        return;
    }
    const schoolTemplates = JSON.parse(fs.readFileSync(schoolPath, 'utf8'));

    // Process each login scenario
    for (const login of loginScenarios) {
        
        // Find an unregistered school template
        const schoolTemplate = schoolTemplates.find(s => s.isRegistered === false);
        if (!schoolTemplate) {
            console.log('No unregistered school templates available.');
            break;
        }

        console.log(`Registering School for: ${login.email}`);

        // 1. Login
        await page.goto('/sign-in');
        await page.locator('[data-cy="email-input"]').fill(login.email);
        await page.locator('[data-cy="password-input"]').fill(login.currentPassword);
        await page.locator('[data-cy="submit-button"]').click();

        // 2. Wait for loading (sync fix)
        await page.waitForURL(/.*agency-portal/);
        await page.waitForFunction(() => {
          const item = localStorage.getItem('agencyPrograms');
          if (!item) return false;
          try {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) && parsed.length > 0;
          } catch (e) {
            return false;
          }
        }, { timeout: 15000 });

        // 3. Navigate to Schools Add
        await page.goto('/agency-portal/schools/add');

        // 4. Fill Form (Random Name + JSON selections)
        const randomSchoolName = `${schoolTemplate.schoolNamePrefix} ${faker.company.buzzNoun()}`;
        await page.locator('[data-cy="school-name-input"]').fill(randomSchoolName);
        await page.locator('[data-cy="school-code-input"]').fill(schoolTemplate.schoolCode);

        await page.locator('[data-cy="school-type-select"]').click();
        await page.getByRole('option', { name: new RegExp(schoolTemplate.schoolType, 'i') }).click();

        await page.locator('[data-cy="address-input"]').fill(schoolTemplate.address);
        await page.locator('[data-cy="city-select"]').click();
        await page.getByRole('option', { name: new RegExp(schoolTemplate.city, 'i') }).first().click();

        // Submit
        const submitBtn = page.locator('[data-cy="submit-button"]');
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // 5. Verification
        await page.waitForURL(/.*agency-portal\/schools$/);
        await expect(page).toHaveURL(/.*agency-portal\/schools/);
        
        console.log(`School "${randomSchoolName}" registered successfully for ${login.email}`);

        // 6. Update Templates
        schoolTemplate.isRegistered = true;
        schoolTemplate.usedRandomName = randomSchoolName;
        schoolTemplate.assignedTo = login.email;
        fs.writeFileSync(schoolPath, JSON.stringify(schoolTemplates, null, 2));

        // Logout
        await page.goto('/sign-out');
    }
  });

});
