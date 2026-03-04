import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

test.describe('PSAV - School Registration Flow', () => {

  test('03 - Successful School Registration for All Scenarios', async ({ page }) => {
    const loginPath = path.join(__dirname, '02-Login-PSAV.json');
    const schoolPath = path.join(__dirname, '03-Registro-Escuela-PSAV.json');
    if (!fs.existsSync(loginPath) || !fs.existsSync(schoolPath)) return;

    const loginScenarios = JSON.parse(fs.readFileSync(loginPath, 'utf8'));
    const schoolTemplates = JSON.parse(fs.readFileSync(schoolPath, 'utf8'));

    for (const login of loginScenarios) {
        const schoolTemplate = schoolTemplates.find(s => s.isRegistered === false);
        if (!schoolTemplate) break;

        await page.goto('/sign-in');
        await page.locator('[data-cy="email-input"]').fill(login.email);
        await page.locator('[data-cy="password-input"]').fill(login.currentPassword);
        await page.locator('[data-cy="submit-button"]').click();

        await page.waitForURL(/.*agency-portal/);
        await page.waitForFunction(() => !!localStorage.getItem('agencyPrograms'));

        await page.goto('/agency-portal/schools/add');

        const randomSchoolName = `${schoolTemplate.schoolNamePrefix} ${faker.company.buzzNoun()}`;
        await page.locator('[data-cy="school-name-input"]').fill(randomSchoolName);
        await page.locator('[data-cy="school-code-input"]').fill(schoolTemplate.schoolCode);
        await page.locator('[data-cy="school-type-select"]').click();
        await page.getByRole('option', { name: new RegExp(schoolTemplate.schoolType, 'i') }).click();

        await page.locator('[data-cy="address-input"]').fill(schoolTemplate.address);
        await page.locator('[data-cy="city-select"]').click();
        await page.getByRole('option', { name: new RegExp(schoolTemplate.city, 'i') }).first().click();

        await page.locator('[data-cy="submit-button"]').click();
        await page.waitForURL(/.*agency-portal\/schools$/);
        
        schoolTemplate.isRegistered = true;
        schoolTemplate.usedRandomName = randomSchoolName;
        schoolTemplate.assignedTo = login.email;
        fs.writeFileSync(schoolPath, JSON.stringify(schoolTemplates, null, 2));

        await page.goto('/sign-out');
    }
  });
});
