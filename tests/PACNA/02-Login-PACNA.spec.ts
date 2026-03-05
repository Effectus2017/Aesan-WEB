import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('PACNA - Login and Password Change Flow', () => {

  test('02 - Sequential Login and Pass Change for All Scenarios', async ({ page }) => {
    const inputPath = path.join(__dirname, '02-Login-PACNA.json');
    const outputPath = path.join(__dirname, '03-Registro-Escuela-PACNA.json');
    
    if (!fs.existsSync(inputPath)) {
        console.log('02-Login-PACNA.json not found. Skipping.');
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

        console.log(`Processing Login/PassChange for scenario: ${scenario.id} (${scenario.email})`);
        
        const newPassword = 'Password123!';

        // 1. Go directly to Password Update URL
        console.log('Navigating to update-password page...');
        await page.goto(`/update-password?email=${scenario.email}`);
        
        // Wait for the form
        const oldPassField = page.locator('[data-cy="old-password-input"]').or(page.getByLabel(/Contraseña Temporera/i));
        
        // Check if we are actually on the update page or if we were redirected (maybe already changed)
        if (await oldPassField.first().isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('Filling password change form...');
            await oldPassField.first().fill(scenario.tempPassword);
            
            const newPassField = page.locator('[data-cy="new-password-input"]').or(page.getByLabel(/Nueva Contraseña/i));
            await newPassField.first().fill(newPassword);
            
            const confirmPassField = page.locator('[data-cy="confirm-password-input"]').or(page.getByLabel(/Confirmar Contraseña/i));
            await confirmPassField.first().fill(newPassword);
            
            const changeBtn = page.locator('[data-cy="change-password-submit-button"]')
                .or(page.getByRole('button', { name: /Actualizar Contraseña|Cambiar contraseña/i }));
                
            await expect(changeBtn.first()).toBeEnabled();
            await changeBtn.first().click();

            // Wait for success message or redirection to sign-in
            console.log('Waiting for password update confirmation...');
            await page.waitForURL(/.*sign-in/, { timeout: 15000 });
        } else {
            console.log('Password might already be changed or redirection occurred. Moving to sign-in.');
            await page.goto('/sign-in');
        }

        // 2. Login with New Password
        console.log(`Logging in with: ${scenario.email}`);
        await page.locator('[data-cy="email-input"]').fill(scenario.email);
        await page.locator('[data-cy="password-input"]').fill(newPassword);
        await page.locator('[data-cy="submit-button"]').click();

        // 3. Verify Success and redirection to dashboard
        console.log('Waiting for dashboard redirection...');
        await page.waitForURL(/.*agency-portal/, { timeout: 15000 });
        console.log(`Logged in successfully to dashboard for ${scenario.email}`);

        // 4. Update INPUT file
        scenario.isPasswordChanged = true;
        scenario.currentPassword = newPassword;
        fs.writeFileSync(inputPath, JSON.stringify(allScenarios, null, 2));

        // 5. Pipe to OUTPUT file (03-Registro-Escuela)
        let schoolScenarios = [];
        if (fs.existsSync(outputPath)) {
            try {
                schoolScenarios = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
                if (!Array.isArray(schoolScenarios)) schoolScenarios = [];
            } catch (e) {
                schoolScenarios = [];
            }
        }
        
        // Only pipe if not already there
        if (!schoolScenarios.find(s => s.id === scenario.id)) {
            schoolScenarios.push({
                id: scenario.id,
                agencyName: scenario.agencyName,
                email: scenario.email,
                currentPassword: newPassword,
                isSchoolRegistered: false
            });
            fs.writeFileSync(outputPath, JSON.stringify(schoolScenarios, null, 2));
        }

        // Logout for next scenario
        await page.goto('/sign-out');
    }
  });

});
