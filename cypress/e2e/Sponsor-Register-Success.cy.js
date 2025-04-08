describe('Pruebas de registro de auspiciador', () => {
    const { faker } = require('@faker-js/faker');

    beforeEach(() => {
        cy.intercept('POST', 'https://localhost:5002/auth/login').as('login');
        cy.intercept('GET', 'https://localhost:5002/program/get-all-programs-from-db?take=25&skip=0&alls=false&names=PDAM,PSAV,PACNA').as('programs');
        cy.visit('https://nutre-dev.local:4202');
        cy.get('[data-cy=sign-up-link]').should('be.visible').click();
        cy.wait('@programs');
        cy.get('[data-cy=sign-up-form]').should('be.visible');
    });

    //Test para registro exitoso
    it('Registro exitoso con datos válidos', () => {
        cy.visit('/sponsor/register');

        // Seleccionar programa PDAM
        cy.get('[data-cy=program-select]').scrollIntoView().should('be.visible').click();
        cy.get('mat-option').contains('PDAM').scrollIntoView().should('be.visible').click();

        // Campos de elegibilidad
        cy.get('[data-cy=non-profit-field]').scrollIntoView().should('be.visible').click();
        cy.get('mat-option').contains('Sí').scrollIntoView().should('be.visible').click();

        cy.get('[data-cy=basic-education-registry-field]').scrollIntoView().should('be.visible').click();
        cy.get('mat-option').contains('Sí').scrollIntoView().should('be.visible').click();

        cy.get('[data-cy=federal-funds-denied-field]').scrollIntoView().should('be.visible').click();
        cy.get('mat-option').contains('No').scrollIntoView().should('be.visible').click();

        cy.get('[data-cy=state-funds-denied-field]').scrollIntoView().should('be.visible').click();
        cy.get('mat-option').contains('No').scrollIntoView().should('be.visible').click();

        cy.get('[data-cy=organized-athletic-programs-field]').scrollIntoView().should('be.visible').click();
        cy.get('mat-option').contains('Sí').scrollIntoView().should('be.visible').click();

        // Datos de la agencia
        cy.get('[data-cy=agency-name]').scrollIntoView().should('be.visible').type('Agencia de Prueba');
        cy.get('[data-cy=sdr-number]').scrollIntoView().should('be.visible').type('123456');
        cy.get('[data-cy=uie-number]').scrollIntoView().should('be.visible').type('789012');
        cy.get('[data-cy=ein-number]').scrollIntoView().should('be.visible').type('345678');

        // Ubicación
        cy.get('[data-cy=address]').scrollIntoView().should('be.visible').type('Calle Principal #123');
        cy.get('[data-cy=city-select]').scrollIntoView().should('be.visible').click();
        cy.get('mat-option').contains('Camuy').scrollIntoView().should('be.visible').click();
        cy.get('[data-cy=zip-code]').scrollIntoView().should('be.visible').type('00627');
        cy.get('[data-cy=latitude]').scrollIntoView().should('be.visible').type('18.4834');
        cy.get('[data-cy=longitude]').scrollIntoView().should('be.visible').type('-66.8451');

        // Copiar dirección física a postal
        cy.get('[data-cy=copy-address]').scrollIntoView().should('be.visible').click();

        // Información de contacto
        cy.get('[data-cy=email]').scrollIntoView().should('be.visible').type('prueba@agencia.com');
        cy.get('[data-cy=phone]').scrollIntoView().should('be.visible').type('7871234567');
        cy.get('[data-cy=administration-title]').scrollIntoView().should('be.visible').type('Director Ejecutivo');

        // Tiempo de servicio
        cy.get('[data-cy=service-time]').scrollIntoView().should('be.visible').type('2022-01-01');

        // Interceptar la solicitud POST
        cy.intercept('POST', '/api/agency').as('registerAgency');

        // Enviar el formulario
        cy.get('[data-cy=submit-button]').scrollIntoView().should('be.visible').click();

        // Verificar la solicitud y respuesta
        cy.wait('@registerAgency').then((interception) => {
            // Agregar los campos requeridos al cuerpo de la solicitud
            const requestBody = {
                ...interception.request.body,
                monitorId: 'monitor123',
                assignedBy: 'admin'
            };

            // Imprimir el cuerpo de la solicitud para depuración
            cy.log('Request body:', JSON.stringify(requestBody, null, 2));

            // Si la respuesta no es 200, imprimir los detalles del error
            if (interception.response.statusCode !== 200) {
                cy.log('Response status:', interception.response.statusCode);
                cy.log('Response body:', JSON.stringify(interception.response.body, null, 2));
                throw new Error(`Registration failed: ${JSON.stringify(interception.response.body)}`);
            }

            // Verificar que la solicitud fue exitosa
            expect(interception.response.statusCode).to.equal(200);
        });
    });
});
