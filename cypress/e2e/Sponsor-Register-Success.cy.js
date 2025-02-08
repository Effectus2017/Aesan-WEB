describe('Pruebas de registro de auspiciador', () => {
    const { faker } = require('@faker-js/faker');

    beforeEach(() => {
        cy.intercept('POST', 'https://localhost:5000/auth/login').as('login');
        cy.intercept('GET', 'http://localhost:5000/user/get-all-programs-from-db?take=10&skip=0').as('programs');
        cy.visit('http://localhost:4200');
        cy.wait(100);
        cy.get('[data-cy=sign-up-link]').click();
        cy.wait(100);
    });

    //Test para registro exitoso
    it('Registro exitoso con datos válidos', () => {
        // Seleccionar programa PACNA (permite organizaciones con fines de lucro)
        cy.get('[data-cy=program-select]').click();
        cy.get('[data-cy=program-option]').contains('PDAM').click(); // Seleccionar PDAM
        cy.get('body').click(0, 0); // Cerrar el menú de selección múltiple haciendo clic en la esquina superior izquierda

        // Completar campos de elegibilidad
        cy.get('[data-cy=non-profit-select]').click();
        cy.get('[data-cy=non-profit-yes]').contains('Yes').click(); // PACNA permite "Yes"

        // No tiene fondos estatales denegados
        cy.get('[data-cy=state-funds-denied-select]').click();
        cy.get('[data-cy=state-funds-denied-no]').contains('No').click();

        // No tiene fondos federales denegados
        cy.get('[data-cy=federal-funds-denied-select]').click();
        cy.get('[data-cy=federal-funds-denied-no]').contains('No').click();

        cy.get('[data-cy=organized-athletic-programs-select]').click();
        cy.get('[data-cy=organized-athletic-programs-no]').contains('No').click();

        // Datos de la agencia
        const agencyName = faker.company.name();
        cy.get('[data-cy=agency-input]').type(agencyName);
        cy.get('[data-cy=uie-input]').type(faker.string.numeric(6));
        cy.get('[data-cy=sdr-input]').type(faker.string.numeric(6));
        cy.get('[data-cy=ein-input]').type(faker.string.numeric(6));

        // Seleccionar región
        cy.get('[data-cy=region-select]').click();
        cy.get('[data-cy=region-option]').contains('Arecibo').click();

        cy.wait(100); // Esperar a que carguen las regiones

        // Ubicación
        cy.get('[data-cy=city-select]').click();
        cy.get('[data-cy=city-option]').contains('Camuy').click();

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
        cy.get('[data-cy=same-as-physical-address-checkbox]').click();

        // Seleccionar región
        cy.get('[data-cy=postal-region-select]').click();
        cy.get('[data-cy=postal-region-option]').contains('Arecibo').click();

        cy.wait(100); // Esperar a que carguen las regiones

        // Ubicación
        cy.get('[data-cy=postal-city-select]').click();
        cy.get('[data-cy=postal-city-option]').contains('Camuy').click();

        // // Verificar que los campos de dirección postal se llenan automáticamente
        // cy.get('[data-cy=postal-address-input]').should('have.value', faker.location.streetAddress());
        // cy.get('[data-cy=postal-city-select]').should('have.value', 'Arecibo');
        // cy.get('[data-cy=postal-region-select]').should('have.value', 'Aguada');
        // cy.get('[data-cy=postal-zip-code-input]').should('have.value', faker.string.numeric(5));

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
        });

        // Redirigir a la página de inicio de sesión
        cy.visit('http://localhost:4200');
        // Verificar que se redirige a la página de inicio de sesión
        cy.url().should('include', '/sign-in');

        // Realizar login con las credenciales del usuario
        cy.get('[data-cy=email-input]').type(email); // Usar el correo generado
        cy.get('[data-cy=password-input]').type('9c272156'); // Usar la contraseña temporal
        cy.get('[data-cy=submit-button]').click(); // Hacer clic en el botón de inicio de sesión

        cy.wait(1000);

        // Verificar que se redirige a la página principal
        cy.visit('http://localhost:4200/admin-portal/validation-to-program');

        // Buscar la agencia recién creada
        cy.get('[data-cy=generic-header-search-input]').type(agencyName); // Asumiendo que el nombre de la agencia es el que se generó
        cy.get('[data-cy=generic-header-search-button]').click(); // Hacer clic en el botón de búsqueda

        // Verificar que la agencia aparece en la lista
        cy.get('[data-cy=generic-table-cells]').should('contain', agencyName);

    });
});
