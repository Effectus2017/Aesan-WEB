describe('Pruebas de inicio de sesión', () => {
    beforeEach(() => {
        cy.intercept('POST', 'https://localhost:5000/auth/login').as('login'); // Interceptar la solicitud de inicio de sesión
        cy.intercept('GET', 'http://localhost:5000/user/get-all-programs-from-db?take=10&skip=0').as('programs'); // Interceptar la solicitud de inicio de sesión
    });

    // it('Debería permitir iniciar sesión con credenciales válidas', () => {
    //     cy.visit('http://localhost:4200');
    //     // Ingresar el correo electrónico
    //     cy.get('[data-cy=email-input]').type('admin@admin.com');

    //     // Ingresar la contraseña
    //     cy.get('[data-cy=password-input]').type('@dmin5812931!');

    //     // Hacer clic en el botón de inicio de sesión
    //     cy.get('[data-cy=submit-button]').click();

    //     // Espera a que se complete la solicitud de inicio de sesión
    //     // cy.wait('@login', { timeout: 5000 }).then((interception) => {
    //     //     cy.log('login', interception); // Verifica la información de la interceptación
    //     //     expect(interception.response.statusCode).to.eq(200); // Verifica el código de estado
    //     //     expect(interception.response.body).to.have.property('access_token'); // Verifica que la respuesta contenga un token
    //     //     // Verifica que la redirección sea correcta
    //     //     cy.url().should('include', '/auth-redirect');
    //     // });

    //     cy.visit('http://localhost:4200/admin-portal/validation-to-program');

    // });

    // it('Debería mostrar un error con credenciales inválidas', () => {
    //     cy.visit('http://localhost:4200');
    //     // Ingresar un correo electrónico inválido
    //     cy.get('[data-cy=email-input]').type('wrong@admin.com');

    //     // Ingresar una contraseña incorrecta
    //     cy.get('[data-cy=password-input]').type('wrongpassword');

    //     // Hacer clic en el botón de inicio de sesión
    //     cy.get('[data-cy=submit-button]').click();

    //     // cy.wait('@login', { timeout: 5000 }).then((interception) => {
    //     //     cy.log('login', interception); // Verifica la información de la interceptación
    //     //     expect(interception.response.statusCode).to.eq(401); // Verifica el código de estado
    //     // });

    //     // Verificar que se muestra un mensaje de error
    //     cy.get('[data-cy=email-required-error]').should('not.exist'); // Asegurarse de que no hay error de requerido
    //     cy.get('[data-cy=password-required-error]').should('not.exist'); // Asegurarse de que no hay error de requerido
    //     cy.get('[data-cy=email-invalid-error]').should('not.exist'); // Asegurarse de que no hay error de email inválido
    //     cy.get('[data-cy=password-required-error]').should('not.exist'); // Asegurarse de que no hay error de contraseña requerida
    //     cy.get('[data-cy=submit-button]').should('be.visible'); // Asegurarse de que el botón de envío sigue visible
    //     cy.get('[data-cy=email-field]').should('be.visible'); // Asegurarse de que el campo de email sigue visible
    //     cy.get('[data-cy=password-field]').should('be.visible'); // Asegurarse de que el campo de contraseña sigue visible

    // });

    it('Ir a Registro', () => {
        cy.visit('http://localhost:4200');
        cy.wait(500);
        cy.get('[data-cy=sign-up-link]').click();

        cy.wait(500);

        cy.get('[data-cy=program-select]').click(); // Cambia 'Program Name' por un valor válido
        cy.get('[data-cy=program-option]').contains('PDAM').click(); // Cambia 'Program Name' por un valor válido


        cy.get('[data-cy=agency-input]').type('Agencia de Prueba');
        cy.get('[data-cy=sdr-input]').type('123456');
        cy.get('[data-cy=address-input]').type('123 Calle Principal');

        cy.get('[data-cy=city-select]').click(); // Cambia 'City Name' por un valor válido
        cy.get('[data-cy=city-option]').contains('Arecibo').click(); // Cambia 'City Name' por un valor válido

        cy.wait(500);

        cy.get('[data-cy=region-select]').click(); // Cambia 'Region Name' por un valor válido
        cy.get('[data-cy=region-option]').contains('Aguada').click(); // Cambia 'Region Name' por un valor válido

        cy.get('[data-cy=postal-code-input]').type('12345');
        cy.get('[data-cy=first-name-input]').type('Juan');
        cy.get('[data-cy=father-last-name-input]').type('Pérez');
        cy.get('[data-cy=admin-title-input]').type('Director');

        cy.get('[data-cy=non-profit-select]').click();
        cy.get('[data-cy=non-profit-yes]').contains('Yes').click();

        cy.get('[data-cy=uie-input]').type('123456789');
        cy.get('[data-cy=ein-input]').type('987654321');
        cy.get('[data-cy=latitude-input]').type('12.345678');
        cy.get('[data-cy=longitude-input]').type('-12.345678');
        cy.get('[data-cy=phone-input]').type('1-787-123-4567');
        cy.get('[data-cy=email-input]').type('juan.perez@example.com');
        cy.get('[data-cy=middle-name-input]').type('Alberto');
        cy.get('[data-cy=mother-last-name-input]').type('García');

        // Hacer clic en el botón de registro
        cy.get('[data-cy=submit-button]').click();


    });


});
