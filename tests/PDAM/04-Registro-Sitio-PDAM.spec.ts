import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

test.describe('PDAM - Site Registration Flow', () => {

  test('04 - Successful Site Registration for All Scenarios', async ({ page }) => {
    const loginPath = path.join(__dirname, '02-Login-PDAM.json');
    const sitePath = path.join(__dirname, '04-Registro-Sitio-PDAM.json');
    if (!fs.existsSync(loginPath) || !fs.existsSync(sitePath)) return;

    const loginScenarios = JSON.parse(fs.readFileSync(loginPath, 'utf8'));
    const siteTemplates = JSON.parse(fs.readFileSync(sitePath, 'utf8'));

    for (const login of loginScenarios) {
        const siteTemplate = siteTemplates.find(s => s.isRegistered === false);
        if (!siteTemplate) break;

        await page.goto('/sign-in');
        await page.locator('[data-cy="email-input"]').fill(login.email);
        await page.locator('[data-cy="password-input"]').fill(login.currentPassword);
        await page.locator('[data-cy="submit-button"]').click();

        await page.waitForURL(/.*agency-portal/);
        await page.waitForFunction(() => !!localStorage.getItem('agencyPrograms'));

        await page.goto('/agency-portal/sites/add');

        const randomSiteName = `${siteTemplate.siteNamePrefix} ${faker.commerce.productName()}`;
        const randomResponsible = `${siteTemplate.responsiblePrefix} ${faker.person.fullName()}`;

        await page.locator('[data-cy="site-name-input"]').fill(randomSiteName);
        await page.locator('[data-cy="address-input"]').fill(siteTemplate.address);
        await page.locator('[data-cy="city-select"]').click();
        await page.getByRole('option', { name: new RegExp(siteTemplate.city, 'i') }).first().click();
        
        await page.locator('[data-cy="zip-code-input"]').fill(siteTemplate.zipCode);
        await page.locator('[data-cy="latitude-input"]').fill(siteTemplate.latitude);
        await page.locator('[data-cy="longitude-input"]').fill(siteTemplate.longitude);
        await page.locator('[data-cy="site-responsible-input"]').fill(randomResponsible);
        await page.locator('[data-cy="phone-input"]').fill(siteTemplate.phone);

        await page.locator('[data-cy="submit-button"]').click();
        await page.waitForURL(/.*agency-portal\/sites$/);
        
        siteTemplate.isRegistered = true;
        siteTemplate.usedRandomName = randomSiteName;
        siteTemplate.assignedTo = login.email;
        fs.writeFileSync(sitePath, JSON.stringify(siteTemplates, null, 2));

        await page.goto('/sign-out');
    }
  });
});
