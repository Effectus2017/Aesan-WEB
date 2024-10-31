describe('Pruebas de inicio de sesión', () => {

    // Primero, importamos faker al inicio del archivo
    const { faker } = require('@faker-js/faker');

    // Interceptar las solicitudes
    beforeEach(() => {
        cy.intercept('POST', 'https://localhost:5000/auth/login').as('login'); // Interceptar la solicitud de inicio de sesión
        cy.intercept('GET', 'http://localhost:5000/user/get-all-programs-from-db?take=10&skip=0').as('programs'); // Interceptar la solicitud de inicio de sesión
    });

    it('Ir a Registro', () => {
        cy.visit('http://localhost:4200');

        cy.wait(500);
        cy.get('[data-cy=sign-up-link]').click();

        cy.wait(500);

        // Selección de programa
        cy.get('[data-cy=program-select]').click();
        cy.get('[data-cy=program-option]').contains('PDAM').click();
        // Si necesitas seleccionar más programas, puedes agregar más selecciones así:
        // cy.get('[data-cy=program-option]').contains('Otro Programa').click();
        // Cerrar el menú de selección (click fuera)
        // cy.get('body').click();

        // Campo de organización sin fines de lucro
        cy.get('[data-cy=non-profit-select]').click();
        cy.get('[data-cy=non-profit-yes]').contains('Yes').click();

        // Nuevos campos de fondos denegados
        cy.get('[data-cy=state-funds-denied-select]').click();
        cy.get('[data-cy=state-funds-denied-no]').click();

        // Campo de fondos federales denegados
        cy.get('[data-cy=federal-funds-denied-select]').click();
        cy.get('[data-cy=federal-funds-denied-no]').click();

        // Campos existentes con datos aleatorios
        cy.get('[data-cy=agency-input]').type(faker.company.name());
        cy.get('[data-cy=uie-input]').type(faker.string.numeric(6));
        cy.get('[data-cy=sdr-input]').type(faker.string.numeric(6));
        cy.get('[data-cy=ein-input]').type(faker.string.numeric(6));

        // Selección de ciudad
        cy.get('[data-cy=city-select]').click(); // Cambia 'City Name' por un valor válido
        cy.get('[data-cy=city-option]').contains('Arecibo').click(); // Cambia 'City Name' por un valor válido

        cy.wait(500);

        // Selección de región
        cy.get('[data-cy=region-select]').click(); // Cambia 'Region Name' por un valor válido
        cy.get('[data-cy=region-option]').contains('Aguada').click(); // Cambia 'Region Name' por un valor válido
        cy.get('[data-cy=latitude-input]').type(faker.location.latitude({ min: 17.9, max: 18.5 }).toString());
        cy.get('[data-cy=longitude-input]').type(faker.location.longitude({ min: -67.2, max: -65.5 }).toString());

        // Dirección y contacto aleatorios
        cy.get('[data-cy=address-input]').type(faker.location.streetAddress());
        cy.get('[data-cy=phone-input]').type(`1-787-${faker.string.numeric(3)}-${faker.string.numeric(4)}`);
        cy.get('[data-cy=zip-code-input]').type(faker.string.numeric(5));
        cy.get('[data-cy=postal-address-input]').type('PO Box ' + faker.string.numeric(5));

        // Información personal aleatoria
        cy.get('[data-cy=first-name-input]').type(faker.person.firstName());
        cy.get('[data-cy=father-last-name-input]').type(faker.person.lastName());
        cy.get('[data-cy=middle-name-input]').type(faker.person.firstName());
        cy.get('[data-cy=mother-last-name-input]').type(faker.person.lastName());

        // Correo y cargo aleatorios
        cy.get('[data-cy=email-input]').type(faker.internet.email());
        cy.get('[data-cy=admin-title-input]').type(faker.person.jobTitle());

        // Hacer clic en el botón de registro
        cy.get('[data-cy=submit-button]').click();

    });


});
