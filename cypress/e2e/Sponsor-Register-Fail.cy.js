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

    // Test para validar organización sin fines de lucro con PDAM/PSAV
    it('Validar notificación para organización con fines de lucro en PDAM/PSAV', () => {
        // Seleccionar programa PDAM
        cy.get('[data-cy=program-select]').click();
        cy.get('[data-cy=program-option]').contains('PDAM').click();
        cy.get('[data-cy=program-option]').contains('PACNA').click(); // Seleccionar PACNA también
        cy.get('body').click(0, 0); // Cerrar el menú de selección múltiple haciendo clic en la esquina superior izquierda

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
        cy.get('body').click(0, 0); // Cerrar el menú de selección múltiple haciendo clic en la esquina superior izquierda

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
});
