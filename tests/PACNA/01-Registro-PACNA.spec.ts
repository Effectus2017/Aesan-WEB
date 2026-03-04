import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

test.describe('PACNA - Agency Registration Flow', () => {
    
    test('01 - Successful Agency Registration (Deep Data Driven)', async ({ page }) => {
        const inputPath = path.join(__dirname, '01-Registro-PACNA.json');
        const outputPath = path.join(__dirname, '02-Login-PACNA.json');
        
        if (!fs.existsSync(inputPath)) {
            throw new Error('01-Registro-PACNA.json not found.');
        }

        const allScenarios = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        
        // Find first scenario not yet registered
        const scenarioIndex = allScenarios.findIndex(s => s.isRegistered === false);
        if (scenarioIndex === -1) {
            console.log('No unregistered scenarios found in 01-Registro-PACNA.json. Skipping.');
            return;
        }

        const scenario = allScenarios[scenarioIndex];
        console.log(`Registering Agency: ${scenario.agencyName} (${scenario.id})`);

        // Navigate to sign-up page
        await page.goto('/sign-up');
        await expect(page).toHaveURL(/.*sign-up/);

        console.log(`Registering Agency: ${scenario.agencyName} (${scenario.id})`);

        // 1. Program & Language
        await page.goto('/sign-up');
        await page.locator('[data-cy="program-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.program, 'i') }).click();
        await page.waitForTimeout(1000); // Wait for conditional fields to appear

        // 2. Eligibility & Administrative Questions
        console.log('Filling Eligibility questions...');
        await page.locator('[data-cy="non-profit-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.isNonProfit.replace('í', '[ií]'), 'i') }).click();

        await page.locator('[data-cy="basic-education-registry-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.hasBasicEduRegistry.replace('í', '[ií]'), 'i') }).click();

        // Extended Hours (if applicable)
        console.log('Filling Extended Hours...');
        const extendedHours = page.locator('[data-cy="extended-hours-select"]');
        if (await extendedHours.isVisible()) {
            await extendedHours.click();
            await page.getByRole('option', { name: new RegExp(scenario.hasExtendedHours.replace('í', '[ií]'), 'i') }).click();
        }

        // Date Services Started
        console.log('Filling Service Date...');
        const dateInput = page.locator('[data-cy="services-offered-since-field"] input');
        await dateInput.fill(scenario.serviceDate);
        await dateInput.blur();

        // Funds Denied
        await page.locator('[data-cy="state-funds-denied-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.stateFundsDenied, 'i') }).click();

        await page.locator('[data-cy="federal-funds-denied-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.federalFundsDenied, 'i') }).click();

        // Tax Exemption
        await page.locator('[data-cy="tax-exemption-status-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.taxExemptionStatus.replace('í', '[ií]'), 'i') }).click();

        await page.locator('[data-cy="tax-exemption-type-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.taxExemptionType.replace('í', '[ií]'), 'i') }).click();

        // Entity & Applicant Type
        await page.locator('[data-cy="type-of-entity-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.entityType.replace('í', '[ií]'), 'i') }).click();

        await page.locator('[data-cy="type-of-applicant-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.applicantType.replace('í', '[ií]'), 'i') }).click();

        await page.locator('[data-cy="public-alliance-contract-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.contractType.replace('í', '[ií]').replace('ó', '[oó]'), 'i') }).click();

        // PACNA Specific: Day Care Home
        await page.locator('[data-cy="is-day-care-home-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.isDayCareHome.replace('í', '[ií]'), 'i') }).click();

        // Board Meetings
        await page.locator('[data-cy="board-meetings-per-year-input"]').fill(scenario.boardMeetingsPerYear);
        await page.locator('[data-cy="board-meets-regularly-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.boardMeetsRegularly.replace('í', '[ií]'), 'i') }).click();

        // Executive Authority (Multi-select)
        await page.locator('[data-cy="board-executive-authority-select"]').click();
        for (const authority of scenario.executiveAuthority) {
            await page.getByRole('option', { name: new RegExp(authority.replace('í', '[ií]'), 'i') }).click();
        }
        // Click outside or press Escape to close multi-select
        await page.keyboard.press('Escape');

        // 3. Agency Details (Randomized Name + JSON values)
        console.log('Filling Agency Details...');
        const randomAgencyName = `${scenario.agencyName} ${faker.company.buzzPhrase()}`;
        await page.locator('[data-cy="agency-input"]').fill(randomAgencyName);
        await page.locator('[data-cy="uie-input"]').fill(scenario.uie);
        await page.locator('[data-cy="sdr-input"]').fill(scenario.sdr);
        await page.locator('[data-cy="ein-input"]').fill(scenario.ein);

        // 4. Address
        console.log('Filling Address...');
        await page.locator('[data-cy="address-input"]').fill(scenario.address);
        
        await page.locator('[data-cy="city-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.city, 'i') }).first().click();
        
        console.log('Waiting for region update...');
        await page.waitForTimeout(1000); // Wait for region to populate
        await page.locator('[data-cy="zip-code-input"]').fill(scenario.zipCode);
        await page.locator('[data-cy="latitude-input"]').fill(scenario.latitude);
        await page.locator('[data-cy="longitude-input"]').fill(scenario.longitude);

        await page.locator('[data-cy="same-as-physical-address-checkbox"] input').check();

        // 5. User Information (Randomized Personal Info)
        console.log('Filling User Information...');
        const randomFirstName = faker.person.firstName();
        const randomLastName = faker.person.lastName();
        const randomEmail = faker.internet.email({ firstName: randomFirstName, lastName: randomLastName });

        await page.locator('[data-cy="first-name-input"]').fill(randomFirstName);
        await page.locator('[data-cy="father-last-name-input"]').fill(randomLastName);
        await page.locator('[data-cy="email-input"]').fill(randomEmail);
        await page.locator('[data-cy="phone-input"]').fill(scenario.phone);

        await page.locator('[data-cy="admin-title-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.adminTitle, 'i') }).click();

        // 6. Submit
        console.log('Submitting form...');
        const submitButton = page.locator('[data-cy="submit-button"]');
        await expect(submitButton).toBeEnabled();
        await submitButton.click();

        // Verification: Navigation to Sign-In
        await page.waitForURL(/.*sign-in/, { timeout: 15000 });
        await expect(page).toHaveURL(/.*sign-in/);
        
        // Mark as registered and store randomized details in INPUT file
        scenario.isRegistered = true;
        scenario.usedRandomName = randomAgencyName;
        scenario.usedRandomEmail = randomEmail;
        fs.writeFileSync(inputPath, JSON.stringify(allScenarios, null, 2));

        // Pipe to OUTPUT file (02-Login)
        let loginScenarios = [];
        if (fs.existsSync(outputPath)) {
            try {
                loginScenarios = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
                if (!Array.isArray(loginScenarios)) loginScenarios = [];
            } catch (e) {
                loginScenarios = [];
            }
        }
        
        loginScenarios.push({
            id: scenario.id,
            agencyName: randomAgencyName,
            email: randomEmail,
            tempPassword: scenario.tempPassword,
            currentPassword: scenario.tempPassword,
            isPasswordChanged: false
        });
        fs.writeFileSync(outputPath, JSON.stringify(loginScenarios, null, 2));

        console.log(`Registration successful for PACNA. Data piped to 02-Login-PACNA.json for ${randomEmail}.`);
    });
});
