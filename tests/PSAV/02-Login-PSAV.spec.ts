import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('PSAV - Login and Password Change Flow', () => {

  test('02 - Sequential Login and Pass Change for All Scenarios', async ({ page }) => {
    const inputPath = path.join(__dirname, '02-Login-PSAV.json');
    
    if (!fs.existsSync(inputPath)) {
        console.log('02-Login-PSAV.json not found. Skipping.');
        return;
    }

    const allScenarios = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

    for (let i = 0; i < allScenarios.length; i++) {
        const scenario = allScenarios[i];
        
        // Skip if already has a real password (not the temp one)
        if (scenario.isPasswordChanged) {
            console.log(`Scenario ${scenario.id} already has password changed. Skipping.`);
            continue;
        }

        console.log(`Processing Login/PassChange for PSAV scenario: ${scenario.id} (${scenario.email})`);

        // 1. Initial Login with Temp Password
        await page.goto('/sign-in');
        await page.locator('[data-cy="email-input"]').fill(scenario.email);
        await page.locator('[data-cy="password-input"]').fill(scenario.tempPassword);
        await page.locator('[data-cy="submit-button"]').click();

        // 2. Expect redirection to mandatory password change
        await expect(page.locator('h1, h2, .title').filter({ hasText: /Cambio de contraseña|Cambiar contraseña/i }).first()).toBeVisible({ timeout: 15000 });
        
        const newPassword = 'Password123!';
        
        // Fill change password form
        await page.locator('[data-cy="old-password-input"]').fill(scenario.tempPassword);
        await page.locator('[data-cy="new-password-input"]').fill(newPassword);
        await page.locator('[data-cy="confirm-password-input"]').fill(newPassword);
        
        const changeBtn = page.locator('[data-cy="change-password-submit-button"]');
        await expect(changeBtn).toBeEnabled();
        await changeBtn.click();

        // 3. Verify Success and redirection to dashboard
        await page.waitForURL(/.*agency-portal/);
        console.log(`Password changed successfully for PSAV ${scenario.email}`);

        // 4. Update INPUT file
        scenario.isPasswordChanged = true;
        scenario.currentPassword = newPassword;
        fs.writeFileSync(inputPath, JSON.stringify(allScenarios, null, 2));

        // Logout for next scenario
        await page.goto('/sign-out');
    }
  });

});
