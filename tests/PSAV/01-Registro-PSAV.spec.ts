import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

test.describe('PSAV - Agency Registration Flow', () => {
    
    test('01 - Successful Agency Registration (Deep Data Driven)', async ({ page }) => {
        const inputPath = path.join(__dirname, '01-Registro-PSAV.json');
        const outputPath = path.join(__dirname, '02-Login-PSAV.json');
        
        if (!fs.existsSync(inputPath)) {
            throw new Error('01-Registro-PSAV.json not found.');
        }

        const allScenarios = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        
        // Find first scenario not yet registered
        const scenarioIndex = allScenarios.findIndex(s => s.isRegistered === false);
        if (scenarioIndex === -1) {
            console.log('No unregistered scenarios found. Skipping.');
            return;
        }

        const scenario = allScenarios[scenarioIndex];
        console.log(`Registering Agency: ${scenario.agencyName} (${scenario.id})`);

        // Navigate to sign-up page
        await page.goto('/sign-up');
        await expect(page).toHaveURL(/.*sign-up/);

        // 1. Sponsor Information
        await page.locator('[data-cy="program-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.program, 'i') }).first().click();

        // 2. Eligibility & Administrative Questions
        await page.locator('[data-cy="non-profit-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.isNonProfit, 'i') }).click();

        await page.locator('[data-cy="basic-education-registry-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.hasBasicEduRegistry, 'i') }).click();

        // Funds Denied
        await page.locator('[data-cy="state-funds-denied-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.stateFundsDenied, 'i') }).click();

        await page.locator('[data-cy="federal-funds-denied-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.federalFundsDenied, 'i') }).click();

        // Athletic Programs
        await page.locator('[data-cy="organized-athletic-programs-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.organizedAthleticPrograms, 'i') }).click();

        // Service Time
        const serviceTime = page.locator('[data-cy="service-time-input"], [data-cy="services-offered-since-field"] input');
        if (await serviceTime.isVisible()) {
            await serviceTime.fill(scenario.serviceDate);
        }

        // PSAV Specific: National Youth Program
        const youthProgram = page.locator('[data-cy="national-youth-program-input"]').first();
        if (await youthProgram.isVisible()) {
             await youthProgram.click();
             await page.getByRole('option', { name: new RegExp(scenario.isNationalYouthProgram, 'i') }).click();
        }

        // Tax Exemption
        await page.locator('[data-cy="tax-exemption-status-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.taxExemptionStatus, 'i') }).click();

        await page.locator('[data-cy="tax-exemption-type-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.taxExemptionType, 'i') }).click();

        // Entity & Applicant Type
        await page.locator('[data-cy="type-of-entity-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.entityType, 'i') }).click();

        await page.locator('[data-cy="type-of-applicant-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.applicantType, 'i') }).click();

        await page.locator('[data-cy="public-alliance-contract-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.contractType, 'i') }).click();

        // 3. Agency Details (Randomized Name)
        const randomAgencyName = `${scenario.agencyName} ${faker.company.buzzPhrase()}`;
        await page.locator('[data-cy="agency-input"]').fill(randomAgencyName);
        await page.locator('[data-cy="uie-input"]').fill(scenario.uie);
        await page.locator('[data-cy="sdr-input"]').fill(scenario.sdr);
        await page.locator('[data-cy="ein-input"]').fill(scenario.ein);

        // 4. Address
        await page.locator('[data-cy="address-input"]').fill(scenario.address);
        await page.locator('[data-cy="city-select"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.city, 'i') }).first().click();
        
        await page.waitForTimeout(500);
        await page.locator('[data-cy="zip-code-input"]').fill(scenario.zipCode);
        await page.locator('[data-cy="latitude-input"]').fill(scenario.latitude);
        await page.locator('[data-cy="longitude-input"]').fill(scenario.longitude);

        await page.locator('[data-cy="same-as-physical-address-checkbox"] input').check();

        // 5. User Information (Randomized)
        const randomEmail = faker.internet.email();
        await page.locator('[data-cy="first-name-input"]').fill(faker.person.firstName());
        await page.locator('[data-cy="father-last-name-input"]').fill(faker.person.lastName());
        await page.locator('[data-cy="email-input"]').fill(randomEmail);
        await page.locator('[data-cy="phone-input"]').fill(scenario.phone);

        await page.locator('[data-cy="admin-title-select"], [data-cy="admin-title-input"]').click();
        await page.getByRole('option', { name: new RegExp(scenario.adminTitle, 'i') }).first().click();

        // Submit
        const submitButton = page.locator('[data-cy="submit-button"]');
        await expect(submitButton).toBeEnabled();
        await submitButton.click();

        await page.waitForURL(/.*sign-in/, { timeout: 15000 });
        
        // Mark as registered in INPUT file
        scenario.isRegistered = true;
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

        console.log(`Registration successful for PSAV. Data piped to 02-Login-PSAV.json for ${randomEmail}.`);
    });
});
