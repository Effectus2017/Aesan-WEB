describe('Pruebas de registro de auspiciador', () => {
    const { faker } = require('@faker-js/faker');

    beforeEach(() => {
        cy.intercept('POST', 'https://localhost:5000/auth/login').as('login');
        cy.intercept('GET', 'http://localhost:5000/user/get-all-programs-from-db?take=10&skip=0').as('programs');
        cy.visit('http://localhost:4200');
        cy.wait(500);
        cy.get('[data-cy=sign-up-link]').click();
        cy.wait(500);
    });

    // Test para validar organización sin fines de lucro con PDAM/PSAV
    it('Validar notificación para organización con fines de lucro en PDAM/PSAV', () => {
        // Seleccionar programa PDAM
        cy.get('[data-cy=program-select]').click();
        cy.get('[data-cy=program-option]').contains('PDAM').click();
        cy.get('[data-cy=program-option]').contains('PACNA').click(); // Seleccionar PACNA también

        // Seleccionar "No" para sin fines de lucro
        cy.get('[data-cy=non-profit-select]').click();
        cy.get('[data-cy=non-profit-no]').click();

        // Verificar que aparece la notificación
        cy.contains('Usted no es elegible para participar de los programas de AESAN').should('be.visible');

        // Verificar que el botón está deshabilitado
        cy.get('[data-cy=submit-button]').should('be.disabled');

        // Repetir para PSAV
        cy.get('[data-cy=program-select]').click();
        cy.get('[data-cy=program-option]').contains('PSAV').click();

        // Verificar que la notificación permanece
        cy.contains('Usted no es elegible para participar de los programas de AESAN').should('be.visible');
        cy.get('[data-cy=submit-button]').should('be.disabled');
    });

    // Test para validar fondos denegados con PACNA
    it('Validar notificación para fondos denegados en PACNA', () => {
        // Seleccionar programa PACNA
        cy.get('[data-cy=program-select]').click();
        cy.get('[data-cy=program-option]').contains('PACNA').click();

        // Probar con fondos estatales denegados
        cy.get('[data-cy=state-funds-denied-select]').click();
        cy.get('[data-cy=state-funds-denied-yes]').click();

        // Verificar notificación
        cy.contains('Usted no es elegible para participar en el programa PACNA').should('be.visible');
        cy.get('[data-cy=submit-button]').should('be.disabled');

        // Restablecer fondos estatales
        cy.get('[data-cy=state-funds-denied-select]').click();
        cy.get('[data-cy=state-funds-denied-no]').click();

        // Probar con fondos federales denegados
        cy.get('[data-cy=federal-funds-denied-select]').click();
        cy.get('[data-cy=federal-funds-denied-yes]').click();

        // Verificar notificación
        cy.contains('Usted no es elegible para participar en el programa PACNA').should('be.visible');
        cy.get('[data-cy=submit-button]').should('be.disabled');
    });

    // Test para registro exitoso
    it('Registro exitoso con datos válidos', () => {
        // Seleccionar programa PACNA (permite organizaciones con fines de lucro)
        cy.get('[data-cy=program-select]').click();
        cy.get('[data-cy=program-option]').contains('PACNA').click();
        cy.get('[data-cy=program-option]').contains('PDAM').click(); // Seleccionar PDAM también

        // Completar campos de elegibilidad
        cy.get('[data-cy=non-profit-select]').click();
        cy.get('[data-cy=non-profit-no]').click(); // PACNA permite "No"

        cy.get('[data-cy=state-funds-denied-select]').click();
        cy.get('[data-cy=state-funds-denied-no]').click();

        cy.get('[data-cy=federal-funds-denied-select]').click();
        cy.get('[data-cy=federal-funds-denied-no]').click();

        // Datos de la agencia
        cy.get('[data-cy=agency-input]').type(faker.company.name());
        cy.get('[data-cy=uie-input]').type(faker.string.numeric(6));
        cy.get('[data-cy=sdr-input]').type(faker.string.numeric(6));
        cy.get('[data-cy=ein-input]').type(faker.string.numeric(6));

        // Ubicación
        cy.get('[data-cy=city-select]').click();
        cy.get('[data-cy=city-option]').contains('Arecibo').click();

        cy.wait(500); // Esperar a que carguen las regiones

        cy.get('[data-cy=region-select]').click();
        cy.get('[data-cy=region-option]').contains('Aguada').click();

        // Coordenadas geográficas (limitadas a Puerto Rico)
        cy.get('[data-cy=latitude-input]').type(
            faker.location.latitude({ min: 17.9, max: 18.5 }).toString()
        );
        cy.get('[data-cy=longitude-input]').type(
            faker.location.longitude({ min: -67.2, max: -65.5 }).toString()
        );

        // Dirección y contacto
        cy.get('[data-cy=address-input]').type(faker.location.streetAddress());
        cy.get('[data-cy=phone-input]').type(
            `1-787-${faker.string.numeric(3)}-${faker.string.numeric(4)}`
        );
        cy.get('[data-cy=zip-code-input]').type(faker.string.numeric(5));

        // Seleccionar el checkbox "Same as Physical Address"
        cy.get('[data-cy=same-as-physical-address-checkbox]').check();

        // Verificar que los campos de dirección postal se llenan automáticamente
        cy.get('[data-cy=postal-address-input]').should('have.value', faker.location.streetAddress());
        cy.get('[data-cy=postal-city-select]').should('have.value', 'Arecibo');
        cy.get('[data-cy=postal-region-select]').should('have.value', 'Aguada');
        cy.get('[data-cy=postal-zip-code-input]').should('have.value', faker.string.numeric(5));

        // Información del administrador
        cy.get('[data-cy=first-name-input]').type(faker.person.firstName());
        cy.get('[data-cy=middle-name-input]').type(faker.person.firstName());
        cy.get('[data-cy=father-last-name-input]').type(faker.person.lastName());
        cy.get('[data-cy=mother-last-name-input]').type(faker.person.lastName());

        // Correo y cargo
        const email = faker.internet.email();
        cy.get('[data-cy=email-input]').type(email);
        cy.get('[data-cy=admin-title-input]').type(faker.person.jobTitle());

        // Verificar que el botón está habilitado
        cy.get('[data-cy=submit-button]').should('be.enabled');

        // Interceptar la solicitud POST de registro
        cy.intercept('POST', '**/user/register-user-agency').as('registerRequest');

        // Hacer clic en el botón de registro
        cy.get('[data-cy=submit-button]').click();

        // Esperar la respuesta y verificar
        cy.wait('@registerRequest').then((interception) => {
            // Verificar el código de estado de la respuesta
            expect(interception.response.statusCode).to.eq(200);

            // Verificar que se redirige a la página de inicio de sesión
            cy.url().should('include', '/sign-in');

            // Verificar mensaje de éxito (si existe)
            cy.contains('Usuario registrado exitosamente').should('exist');
        });
    });
});
