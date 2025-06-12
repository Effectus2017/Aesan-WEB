// Cypress E2E test for Add School feature

describe('Pruebas de registro de escuela', () => {
  const schoolName = `Escuela Cypress Test ${Date.now()}`;

  beforeEach(() => {
    // Interceptar catálogos y dependencias
    cy.intercept('GET', '/geo/get-cities-from-db*').as('getCities');
    cy.intercept('GET', '/geo/get-regions-from-db*').as('getRegions');
    cy.intercept('GET', '/geo/get-regions-by-city-id*').as('getRegionsByCity');
    cy.intercept('GET', '/organization-type/get-all-organization-types-from-db*').as('getOrganizationTypes');
    cy.intercept('GET', '/education-level/get-all-education-levels-from-db*').as('getEducationLevels');
    cy.intercept('GET', '/center-type/get-all-center-types-from-db*').as('getCenterTypes');
    cy.intercept('GET', '/kitchen-type/get-all-kitchen-types-from-db*').as('getKitchenTypes');
    cy.intercept('GET', '/group-type/get-all-group-types-from-db*').as('getGroupTypes');
    cy.intercept('GET', '/sponsor-type/get-all-sponsor-types-from-db*').as('getSponsorTypes');
    cy.intercept('GET', '/delivery-type/get-all-delivery-types-from-db*').as('getDeliveryTypes');
    cy.intercept('GET', '/operating-policy/get-all-operating-policies-from-db*').as('getOperatingPolicies');
    cy.intercept('GET', '/option-selection/get-option-selection-by-option-key*').as('getOptionSelections');
    cy.intercept('POST', '/school/insert-school').as('insertSchool');
    cy.visit('/schools/add');
    cy.wait(['@getCities', '@getRegions', '@getOrganizationTypes', '@getEducationLevels', '@getCenterTypes', '@getKitchenTypes', '@getGroupTypes', '@getSponsorTypes', '@getDeliveryTypes', '@getOperatingPolicies', '@getOptionSelections']);
  });

  it('Registro exitoso de escuela con datos válidos', () => {
    cy.get('[data-cy="schools-add-form"]').should('be.visible').within(() => {
      cy.get('[data-cy="name-field"] input').scrollIntoView().should('be.visible').type(schoolName);
      cy.get('[data-cy="address-input"]').scrollIntoView().should('be.visible').type('Calle 123');
      cy.get('[data-cy="city-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="city-option"]').first().should('be.visible').click();
      cy.wait('@getRegionsByCity');
      cy.get('[data-cy="region-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="region-option"]').first().should('be.visible').click();
      cy.get('[data-cy="zip-code-input"]').scrollIntoView().should('be.visible').type('00999');
      cy.get('[data-cy="latitude-input"]').scrollIntoView().should('be.visible').type('18.1234');
      cy.get('[data-cy="longitude-input"]').scrollIntoView().should('be.visible').type('-66.1234');
      cy.get('[data-cy="same-as-physical-address-checkbox"] input[type="checkbox"]').scrollIntoView().should('be.visible').check({ force: true });
      cy.get('[data-cy="postal-address-input"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="postal-city-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="postal-city-option"]').first().should('be.visible').click();
      cy.wait('@getRegionsByCity');
      cy.get('[data-cy="postal-region-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="postal-region-option"]').first().should('be.visible').click();
      cy.get('[data-cy="postal-zip-code-input"]').scrollIntoView().should('be.visible').type('00999');
      cy.get('[data-cy="non-profit-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option').first().should('be.visible').click();
      cy.get('[data-cy="organization-type-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="organization-type-option"]').first().should('be.visible').click();
      cy.get('[data-cy="center-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="center-option"]').first().should('be.visible').click();
      cy.get('[data-cy="education-level-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="education-level-option"]').first().should('be.visible').click();
      cy.get('[data-cy="operating-days-input"]').scrollIntoView().should('be.visible').type('180');
      cy.get('[data-cy="kitchen-type-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="kitchen-type-option"]').first().should('be.visible').click();
      cy.get('[data-cy="group-type-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="group-type-option"]').first().should('be.visible').click();
      cy.get('[data-cy="delivery-type-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="delivery-type-option"]').first().should('be.visible').click();
      cy.get('[data-cy="sponsor-type-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="sponsor-type-option"]').first().should('be.visible').click();
      cy.get('[data-cy="applicant-type-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="applicant-type-option"]').first().should('be.visible').click();
      cy.get('[data-cy="center-type-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="center-type-option"]').first().should('be.visible').click();
      cy.get('[data-cy="operating-policy-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="operating-policy-option"]').first().should('be.visible').click();
      cy.get('[data-cy="has-warehouse-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="has-warehouse-option"]').first().should('be.visible').click();
      cy.get('[data-cy="has-dining-room-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="has-dining-room-option"]').first().should('be.visible').click();
      cy.get('[data-cy="administrator-authorized-name-input"]').scrollIntoView().should('be.visible').type('Juan Director');
      cy.get('[data-cy="site-phone-input"]').scrollIntoView().should('be.visible').type('7871234567');
      cy.get('[data-cy="extension-input"]').scrollIntoView().should('be.visible').type('101');
      cy.get('[data-cy="mobile-phone-input"]').scrollIntoView().should('be.visible').type('7877654321');
      cy.get('[data-cy="breakfast-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option[data-cy="breakfast-option"]').first().should('be.visible').click();
      cy.get('[data-cy="breakfast-from-input"]').scrollIntoView().should('be.visible').type('07:00');
      cy.get('[data-cy="breakfast-to-input"]').scrollIntoView().should('be.visible').type('07:30');
      cy.get('[data-cy="lunch-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option').first().should('be.visible').click();
      cy.get('[data-cy="lunch-from-input"]').scrollIntoView().should('be.visible').type('12:00');
      cy.get('[data-cy="lunch-to-input"]').scrollIntoView().should('be.visible').type('12:30');
      cy.get('[data-cy="snack-select"]').scrollIntoView().should('be.visible').click();
      cy.get('mat-option').first().should('be.visible').click();
      cy.get('[data-cy="snack-from-input"]').scrollIntoView().should('be.visible').type('15:00');
      cy.get('[data-cy="snack-to-input"]').scrollIntoView().should('be.visible').type('15:30');
    });

    cy.contains('button', /Guardar/i).scrollIntoView().should('be.visible').click();

    cy.wait('@insertSchool').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.request.body).to.have.property('name', schoolName);
      expect(interception.request.body).to.have.property('address', 'Calle 123');
    });

    cy.url().should('include', '/schools/list');
    cy.contains(schoolName).should('exist');
  });
});
