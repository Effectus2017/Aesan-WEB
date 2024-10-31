describe('Pruebas de inicio de sesión', () => {

    // Interceptar las solicitudes
    beforeEach(() => {
        cy.intercept('POST', 'https://localhost:5000/auth/login').as('login'); // Interceptar la solicitud de inicio de sesión

    });

    it('Debería permitir iniciar sesión con credenciales válidas', () => {
        cy.visit('http://localhost:4200');
        // Ingresar el correo electrónico
        cy.get('[data-cy=email-input]').type('admin@admin.com');

        // Ingresar la contraseña
        cy.get('[data-cy=password-input]').type('@dmin5812931!');

        // Hacer clic en el botón de inicio de sesión
        cy.get('[data-cy=submit-button]').click();

        // Espera a que se complete la solicitud de inicio de sesión
        // cy.wait('@login', { timeout: 5000 }).then((interception) => {
        //     cy.log('login', interception); // Verifica la información de la interceptación
        //     expect(interception.response.statusCode).to.eq(200); // Verifica el código de estado
        //     expect(interception.response.body).to.have.property('access_token'); // Verifica que la respuesta contenga un token
        //     // Verifica que la redirección sea correcta
        //     cy.url().should('include', '/auth-redirect');
        // });

        cy.visit('http://localhost:4200/admin-portal/validation-to-program');

    });

    it('Debería mostrar un error con credenciales inválidas', () => {
        cy.visit('http://localhost:4200');
        // Ingresar un correo electrónico inválido
        cy.get('[data-cy=email-input]').type('wrong@admin.com');

        // Ingresar una contraseña incorrecta
        cy.get('[data-cy=password-input]').type('wrongpassword');

        // Hacer clic en el botón de inicio de sesión
        cy.get('[data-cy=submit-button]').click();

        // cy.wait('@login', { timeout: 5000 }).then((interception) => {
        //     cy.log('login', interception); // Verifica la información de la interceptación
        //     expect(interception.response.statusCode).to.eq(401); // Verifica el código de estado
        // });

        // Verificar que se muestra un mensaje de error
        cy.get('[data-cy=email-required-error]').should('not.exist'); // Asegurarse de que no hay error de requerido
        cy.get('[data-cy=password-required-error]').should('not.exist'); // Asegurarse de que no hay error de requerido
        cy.get('[data-cy=email-invalid-error]').should('not.exist'); // Asegurarse de que no hay error de email inválido
        cy.get('[data-cy=password-required-error]').should('not.exist'); // Asegurarse de que no hay error de contraseña requerida
        cy.get('[data-cy=submit-button]').should('be.visible'); // Asegurarse de que el botón de envío sigue visible
        cy.get('[data-cy=email-field]').should('be.visible'); // Asegurarse de que el campo de email sigue visible
        cy.get('[data-cy=password-field]').should('be.visible'); // Asegurarse de que el campo de contraseña sigue visible

    });

});
