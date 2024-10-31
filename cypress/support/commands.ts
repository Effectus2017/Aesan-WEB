/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('captureConsoleObject', (filterFunction) => {
    let capturedObject = null;

    cy.window().then((win) => {
      const originalConsoleLog = win.console.log;

      // Sobrescribe console.log para capturar el objeto deseado
      win.console.log = (...args) => {
        originalConsoleLog.apply(win.console, args);

        // Filtra el mensaje de consola
        if (filterFunction(args)) {
          capturedObject = args[0];
        }
      };
    });

    // Devuelve el objeto capturado después de una acción en la página
    cy.wrap(null).then(() => capturedObject);
  });
