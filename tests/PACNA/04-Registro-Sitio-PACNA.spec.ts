import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

test.describe('PACNA - Site Registration Flow', () => {

  test('04 - Successful Site Registration for All Scenarios', async ({ page }) => {
    // 1. Load login data
    const loginPath = path.join(__dirname, '02-Login-PACNA.json');
    if (!fs.existsSync(loginPath)) {
        console.log('02-Login-PACNA.json not found. Skipping.');
        return;
    }
    const loginScenarios = JSON.parse(fs.readFileSync(loginPath, 'utf8'));

    // 2. Load site templates
    const sitePath = path.join(__dirname, '04-Registro-Sitio-PACNA.json');
    if (!fs.existsSync(sitePath)) {
        console.log('04-Registro-Sitio-PACNA.json not found. Skipping.');
        return;
    }
    const siteTemplates = JSON.parse(fs.readFileSync(sitePath, 'utf8'));

    for (const login of loginScenarios) {
        
        const siteTemplate = siteTemplates.find(s => s.isRegistered === false);
        if (!siteTemplate) break;

        console.log(`Registering Site for: ${login.email}`);

        // 1. Login
        await page.goto('/sign-in');
        await page.locator('[data-cy="email-input"]').fill(login.email);
        await page.locator('[data-cy="password-input"]').fill(login.currentPassword);
        await page.locator('[data-cy="submit-button"]').click();

        // 2. Sync fix
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

        // 3. Navigate to Sites Add
        await page.goto('/agency-portal/sites/add');

        // 4. Fill Site Form (Randomized)
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

        // Submit
        const submitBtn = page.locator('[data-cy="submit-button"]');
        await expect(submitBtn).toBeEnabled();
        await submitBtn.click();

        // 5. Verification
        await page.waitForURL(/.*agency-portal\/sites$/);
        await expect(page).toHaveURL(/.*agency-portal\/sites/);
        
        console.log(`Site "${randomSiteName}" registered successfully for ${login.email}`);

        // 6. Update state
        siteTemplate.isRegistered = true;
        siteTemplate.usedRandomName = randomSiteName;
        siteTemplate.assignedTo = login.email;
        fs.writeFileSync(sitePath, JSON.stringify(siteTemplates, null, 2));

        // Logout
        await page.goto('/sign-out');
    }
  });

});
