describe('Validaciones del formulario de registro de auspiciador', () => {
    const { faker } = require('@faker-js/faker');

    beforeEach(() => {
        cy.intercept('POST', 'https://localhost:5002/auth/login').as('login');
        cy.intercept('GET', 'https://localhost:5002/program/get-all-programs-from-db?take=25&skip=0&alls=false&names=PDAM,PSAV,PACNA').as('programs');
        cy.visit('https://nutre-dev.local:4202');
        cy.wait(100);
        cy.get('[data-cy=sign-up-link]').click();
        cy.wait(100);
    });

    describe('Validaciones de elegibilidad por programa', () => {
        it('No permite registro en PDAM si no es organización sin fines de lucro', () => {
            cy.get('[data-cy=program-select]').click();
            cy.get('[data-cy=program-option]').contains('PDAM').click();
            cy.get('body').click(0, 0);

            cy.get('[data-cy=non-profit-select]').click();
            cy.get('[data-cy=non-profit-no]').contains('No').click();

            cy.get('[data-cy=error-message]').should('contain', 'No es elegible para participar en los programas PDAM o PSAV');
            cy.get('[data-cy=submit-button]').should('be.disabled');
        });

        it('No permite registro en PSAV si no es organización sin fines de lucro', () => {
            cy.get('[data-cy=program-select]').click();
            cy.get('[data-cy=program-option]').contains('PSAV').click();
            cy.get('body').click(0, 0);

            cy.get('[data-cy=non-profit-select]').click();
            cy.get('[data-cy=non-profit-no]').contains('No').click();

            cy.get('[data-cy=error-message]').should('contain', 'No es elegible para participar en los programas PDAM o PSAV');
            cy.get('[data-cy=submit-button]').should('be.disabled');
        });

        it('No permite registro en PACNA si tiene fondos estatales denegados', () => {
            cy.get('[data-cy=program-select]').click();
            cy.get('[data-cy=program-option]').contains('PACNA').click();
            cy.get('body').click(0, 0);

            cy.get('[data-cy=state-funds-denied-select]').click();
            cy.get('[data-cy=state-funds-denied-yes]').contains('Sí').click();

            cy.get('[data-cy=error-message]').should('contain', 'No es elegible para participar en el programa PACNA');
            cy.get('[data-cy=submit-button]').should('be.disabled');
        });

        it('No permite registro en PACNA si tiene fondos federales denegados', () => {
            cy.get('[data-cy=program-select]').click();
            cy.get('[data-cy=program-option]').contains('PACNA').click();
            cy.get('body').click(0, 0);

            cy.get('[data-cy=federal-funds-denied-select]').click();
            cy.get('[data-cy=federal-funds-denied-yes]').contains('Sí').click();

            cy.get('[data-cy=error-message]').should('contain', 'No es elegible para participar en el programa PACNA');
            cy.get('[data-cy=submit-button]').should('be.disabled');
        });
    });

    describe('Validaciones de tiempo de servicio', () => {
        it('No permite registro si el tiempo de servicio es menor a un año', () => {
            cy.get('[data-cy=program-select]').click();
            cy.get('[data-cy=program-option]').contains('PDAM').click();
            cy.get('body').click(0, 0);

            const recentDate = new Date();
            recentDate.setMonth(recentDate.getMonth() - 6);
            cy.get('[data-cy=service-time-input]').type(recentDate.toISOString().split('T')[0]);

            cy.get('[data-cy=error-message]').should('contain', 'La organización debe tener al menos un año de servicio');
            cy.get('[data-cy=submit-button]').should('be.disabled');
        });

        it('Permite registro si el tiempo de servicio es mayor a un año', () => {
            cy.get('[data-cy=program-select]').click();
            cy.get('[data-cy=program-option]').contains('PDAM').click();
            cy.get('body').click(0, 0);

            const validDate = new Date();
            validDate.setFullYear(validDate.getFullYear() - 2);
            cy.get('[data-cy=service-time-input]').type(validDate.toISOString().split('T')[0]);

            cy.get('[data-cy=error-message]').should('not.exist');
        });
    });

    describe('Validaciones de formato', () => {
        it('Valida formato de correo electrónico', () => {
            cy.get('[data-cy=email-input]').type('correo_invalido');
            cy.get('[data-cy=email-input]').should('have.class', 'ng-invalid');

            cy.get('[data-cy=email-input]').clear().type('correo@valido.com');
            cy.get('[data-cy=email-input]').should('have.class', 'ng-valid');
        });

        it('Valida formato de números UIE, SDR y EIN', () => {
            // UIE debe tener 6 dígitos
            cy.get('[data-cy=uie-input]').type('12345');
            cy.get('[data-cy=uie-input]').should('have.class', 'ng-invalid');
            cy.get('[data-cy=uie-input]').clear().type('123456');
            cy.get('[data-cy=uie-input]').should('have.class', 'ng-valid');

            // SDR debe tener 6 dígitos
            cy.get('[data-cy=sdr-input]').type('12345');
            cy.get('[data-cy=sdr-input]').should('have.class', 'ng-invalid');
            cy.get('[data-cy=sdr-input]').clear().type('123456');
            cy.get('[data-cy=sdr-input]').should('have.class', 'ng-valid');

            // EIN debe tener 6 dígitos
            cy.get('[data-cy=ein-input]').type('12345');
            cy.get('[data-cy=ein-input]').should('have.class', 'ng-invalid');
            cy.get('[data-cy=ein-input]').clear().type('123456');
            cy.get('[data-cy=ein-input]').should('have.class', 'ng-valid');
        });

        it('Valida coordenadas geográficas dentro de Puerto Rico', () => {
            // Latitud fuera de rango
            cy.get('[data-cy=latitude-input]').type('16.0');
            cy.get('[data-cy=latitude-input]').should('have.class', 'ng-invalid');
            cy.get('[data-cy=latitude-input]').clear().type('18.2');
            cy.get('[data-cy=latitude-input]').should('have.class', 'ng-valid');

            // Longitud fuera de rango
            cy.get('[data-cy=longitude-input]').type('-68.0');
            cy.get('[data-cy=longitude-input]').should('have.class', 'ng-invalid');
            cy.get('[data-cy=longitude-input]').clear().type('-66.5');
            cy.get('[data-cy=longitude-input]').should('have.class', 'ng-valid');
        });
    });

    describe('Validaciones de campos requeridos', () => {
        it('Muestra errores en todos los campos requeridos', () => {
            cy.get('[data-cy=program-select]').click();
            cy.get('[data-cy=program-option]').contains('PDAM').click();
            cy.get('body').click(0, 0);

            cy.get('[data-cy=submit-button]').should('be.disabled');

            // Verificar mensajes de error en campos requeridos
            const requiredFields = [
                'non-profit-select',
                'basic-education-registry-select',
                'state-funds-denied-select',
                'federal-funds-denied-select',
                'organized-athletic-programs-select',
                'service-time-input',
                'tax-exemption-status-select',
                'tax-exemption-type-select',
                'agency-input',
                'uie-input',
                'sdr-input',
                'ein-input',
                'address-input',
                'city-select',
                'zip-code-input',
                'first-name-input',
                'father-last-name-input',
                'email-input',
                'admin-title-input'
            ];

            requiredFields.forEach(field => {
                cy.get(`[data-cy=${field}]`).should('have.class', 'mat-form-field-invalid');
            });
        });
    });

    describe('Validación de copia de dirección', () => {
        it('Copia correctamente todos los campos de dirección física a postal', () => {
            cy.get('[data-cy=program-select]').click();
            cy.get('[data-cy=program-option]').contains('PDAM').click();
            cy.get('body').click(0, 0);

            const address = faker.location.streetAddress();
            const zipCode = faker.string.numeric(5);

            cy.get('[data-cy=address-input]').type(address);
            cy.get('[data-cy=zip-code-input]').type(zipCode);
            cy.get('[data-cy=city-select]').click();
            cy.get('[data-cy=city-option]').contains('Camuy').click();

            cy.wait(100);

            cy.get('[data-cy=same-as-physical-address-checkbox]').click();

            cy.get('[data-cy=postal-address-input]').should('have.value', address);
            cy.get('[data-cy=postal-zip-code-input]').should('have.value', zipCode);
            cy.get('[data-cy=postal-city-select]').should('contain', 'Camuy');

            // Verificar que al desmarcar el checkbox los campos postales se limpian
            cy.get('[data-cy=same-as-physical-address-checkbox]').click();
            cy.get('[data-cy=postal-address-input]').should('have.value', '');
            cy.get('[data-cy=postal-zip-code-input]').should('have.value', '');
        });
    });
});
