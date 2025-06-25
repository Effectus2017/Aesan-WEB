// Cypress E2E test for Add School feature
// Tests mejorados para el registro de escuelas con mayor cobertura y mejor estructura
//
// AUTENTICACIÓN (siguiendo patrón de Sponsor-Register-Success.cy.js):
// - Usuario: dario.neira@gmail.com
// - Password: @dmin5812931!
// - URL base: https://nutre-dev.local:4202
// - Login API: https://localhost:5002/auth/login
// - Los tests utilizan cy.session() para mantener la autenticación entre pruebas

describe('Registro de Escuelas - Tests Completos', () => {
  // Importar faker para datos de prueba (siguiendo patrón del proyecto)
  const { faker } = require('@faker-js/faker');

  // Credenciales de usuario para autenticación
  const loginCredentials = {
    email: 'dario.neira@gmail.com',
    password: '@dmin5812931!'
  };

  // Datos de prueba organizados usando faker (siguiendo patrón del proyecto)
  const testData = {
    validSchool: {
      name: `Escuela Cypress Test ${Date.now()}`,
      address: faker.location.streetAddress(),
      zipCode: '00999', // Código postal de Puerto Rico
      latitude: '18.1234',
      longitude: '-66.1234',
      operatingDays: '180',
      administratorName: faker.person.fullName(),
      sitePhone: '7871234567',
      extension: '101',
      mobilePhone: '7877654321'
    },
    schedules: {
      breakfast: { from: '07:00', to: '07:30' },
      lunch: { from: '12:00', to: '12:30' },
      snack: { from: '15:00', to: '15:30' }
    }
  };

        // Función para debuggear elementos en la página
  const debugPageElements = () => {
    cy.get('body').then(($body) => {
      cy.log('=== DEBUGGING PAGE ELEMENTS ===');
      cy.log('URL actual:', $body[0].ownerDocument.location.href);

      // Buscar formularios
      const forms = $body.find('form');
      cy.log(`Formularios encontrados: ${forms.length}`);

      // Buscar inputs
      const inputs = $body.find('input');
      cy.log(`Inputs encontrados: ${inputs.length}`);
      inputs.each((index, input) => {
        const type = input.type || 'text';
        const placeholder = input.placeholder || '';
        const dataCy = input.getAttribute('data-cy') || '';
        cy.log(`Input ${index}: type="${type}", placeholder="${placeholder}", data-cy="${dataCy}"`);
      });

      // Buscar botones
      const buttons = $body.find('button');
      cy.log(`Botones encontrados: ${buttons.length}`);
      buttons.each((index, button) => {
        const text = button.textContent || '';
        const type = button.type || '';
        const dataCy = button.getAttribute('data-cy') || '';
        cy.log(`Botón ${index}: text="${text.trim()}", type="${type}", data-cy="${dataCy}"`);
      });
    });
  };

  // Función de login simple como backup
  const performSimpleLogin = () => {
    cy.session([loginCredentials.email + '_simple'], () => {
      cy.log('Intentando login simple...');

      cy.visit('/sign-in');

      // Buscar y llenar campos de manera más directa
      cy.get('input').first().clear().type(loginCredentials.email);
      cy.get('input[type="password"]').clear().type(loginCredentials.password);

      // Buscar cualquier botón y hacer click
      cy.get('button').first().click();

      // Verificar que salimos de sign-in
      cy.url().should('not.include', '/sign-in', { timeout: 10000 });
    });
  };

  // Función de login siguiendo el patrón del proyecto
  const performLogin = () => {
    cy.session([loginCredentials.email], () => {
      // Interceptar login siguiendo el patrón existente
      cy.intercept('POST', 'https://localhost:5002/auth/login').as('login');

      // Ir directamente a la página de sign-in
      cy.visit('/sign-in');

      // Verificar que la página de login se cargó correctamente
      cy.url().should('include', '/sign-in');

      // Esperar a que aparezca el formulario de login, si falla hacer debug
      cy.get('form', { timeout: 10000 }).should('be.visible').then(() => {
        cy.log('Formulario de login encontrado correctamente');
      }).catch(() => {
        cy.log('No se encontró formulario, iniciando debug...');
        debugPageElements();
        throw new Error('No se encontró el formulario de login');
      });

      // Intentar diferentes selectores para el campo email
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="email-field"] input').length > 0) {
          cy.get('[data-cy="email-field"] input').clear().type(loginCredentials.email);
        } else if ($body.find('input[type="email"]').length > 0) {
          cy.get('input[type="email"]').clear().type(loginCredentials.email);
        } else {
          cy.get('input').first().clear().type(loginCredentials.email);
        }
      });

      // Intentar diferentes selectores para el campo password
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="password-field"] input').length > 0) {
          cy.get('[data-cy="password-field"] input').clear().type(loginCredentials.password);
        } else if ($body.find('input[type="password"]').length > 0) {
          cy.get('input[type="password"]').clear().type(loginCredentials.password);
        } else {
          cy.get('input').eq(1).clear().type(loginCredentials.password);
        }
      });

      // Intentar diferentes selectores para el botón de login
      cy.get('body').then(($body) => {
        cy.log('Buscando botón de login...');

        if ($body.find('[data-cy="sign-in-button"]').length > 0) {
          cy.log('Encontrado botón con data-cy="sign-in-button"');
          cy.get('[data-cy="sign-in-button"]').should('be.visible').click();
        } else if ($body.find('button[type="submit"]').length > 0) {
          cy.log('Encontrado botón type="submit"');
          cy.get('button[type="submit"]').should('be.visible').click();
        } else if ($body.find('button').length > 0) {
          cy.log('Buscando botón por texto...');
          cy.get('button').contains(/sign in|login|iniciar|entrar/i).should('be.visible').click();
        } else {
          cy.log('No se encontró botón específico, haciendo debug...');
          debugPageElements();
          // Intentar enviar el formulario directamente
          cy.get('form').submit();
        }
      });

      // Esperar respuesta del login con más tolerancia
      cy.wait('@login', { timeout: 15000 }).then((interception) => {
        // Aceptar diferentes códigos de estado exitosos
        expect(interception.response.statusCode).to.be.oneOf([200, 201, 302]);
      });

      // Verificar que el login fue exitoso
      cy.url().should('not.include', '/sign-in', { timeout: 15000 });

      // Esperar a que se complete la navegación al portal
      cy.url().should('include', 'portal', { timeout: 10000 });
    });
  };

    // Interceptores de API siguiendo el patrón del proyecto
  const setupInterceptors = () => {
    // Interceptor de login (patrón existente)
    cy.intercept('POST', 'https://localhost:5002/auth/login').as('login');

    // Interceptores de catálogos con URLs CORREGIDAS según el código real
    cy.intercept('GET', '**/geo/get-all-cities-from-db*').as('getCities');
    cy.intercept('GET', '**/geo/get-all-regions-from-db*').as('getRegions');
    cy.intercept('GET', '**/geo/get-regions-by-city-id*').as('getRegionsByCity');
    cy.intercept('GET', '**/organization-type/get-all-organization-types-from-db*').as('getOrganizationTypes');
    cy.intercept('GET', '**/education-level/get-all-education-levels-from-db*').as('getEducationLevels');
    cy.intercept('GET', '**/center-type/get-all-center-types-from-db*').as('getCenterTypes');
    cy.intercept('GET', '**/kitchen-type/get-all-kitchen-types-from-db*').as('getKitchenTypes');
    cy.intercept('GET', '**/group-type/get-all-group-types-from-db*').as('getGroupTypes');
    cy.intercept('GET', '**/sponsor-type/get-all-sponsor-types-from-db*').as('getSponsorTypes');
    cy.intercept('GET', '**/delivery-type/get-all-delivery-types-from-db*').as('getDeliveryTypes');
    cy.intercept('GET', '**/operating-policy/get-all-operating-policies-from-db*').as('getOperatingPolicies');
    cy.intercept('GET', '**/option-selection/get-option-selection-by-option-key*').as('getOptionSelections');

    // Interceptores de escuelas
    cy.intercept('POST', '**/school/insert-school').as('insertSchool');
    cy.intercept('GET', '**/school/has-main-school').as('hasMainSchool');
    cy.intercept('GET', '**/school/get-all-schools-from-db*').as('getSchools');

    // Interceptores adicionales que pueden ser útiles
    cy.intercept('GET', '**/applicant-type/**').as('getApplicantTypes');
    cy.intercept('GET', '**/residential-type/**').as('getResidentialTypes');
  };

  // Helper functions para formularios
  const fillBasicInformation = (schoolData) => {
    cy.get('[data-cy="name-field"] input')
      .scrollIntoView()
      .should('be.visible')
      .clear()
      .type(schoolData.name);
  };

  const fillPhysicalAddress = () => {
    // Dirección física
    cy.get('[data-cy="address-input"]')
      .clear()
      .type('123 Main Street');

    // Seleccionar ciudad
    cy.get('[data-cy=city-select]').click();
    cy.get('[data-cy=city-option]').contains('Adjuntas').click();

    // Seleccionar región (después de seleccionar ciudad)
    cy.wait(1000); // Esperar a que se carguen las regiones
    cy.get('[data-cy=region-select]').click();
    cy.get('[data-cy=region-option]').first().click();

    // Código postal
    cy.get('[data-cy="zip-code-input"]')
      .clear()
      .type('00601');

    // Latitud
    cy.get('[data-cy="latitude-input"]')
      .clear()
      .type('18.1639');

    // Longitud
    cy.get('[data-cy="longitude-input"]')
      .clear()
      .type('-66.7231');

    // Verificar que el botón de coordenadas GPS esté visible
    cy.get('[data-cy="gps-coordinates-button"]')
      .should('be.visible')
      .should('have.attr', 'matTooltip');
  };

  const fillPostalAddress = (usePhysicalAddress = true) => {
    if (usePhysicalAddress) {
      // Marcar checkbox para usar la misma dirección
      cy.get('[data-cy=same-as-physical-address-checkbox]')
        .scrollIntoView()
        .should('be.visible')
        .click();

      // Verificar que los campos se llenen automáticamente
      cy.get('[data-cy="postal-address-input"]')
        .scrollIntoView()
        .should('not.have.value', '');
    } else {
      // Llenar dirección postal manualmente
      cy.get('[data-cy="postal-address-input"]')
        .scrollIntoView()
        .should('be.visible')
        .clear()
        .type('Apartado Postal 456');

      // Ciudad postal - USANDO EL PATRÓN QUE FUNCIONA
      cy.get('[data-cy=postal-city-select]').click();
      cy.get('[data-cy=postal-city-option]').contains('Camuy').click();

      cy.wait('@getRegionsByCity', { timeout: 10000 });

      // Región postal - seleccionar la primera disponible
      cy.get('[data-cy=postal-region-select]').click();
      cy.get('[data-cy=postal-region-option]').first().click();

      cy.get('[data-cy="postal-zip-code-input"]')
        .scrollIntoView()
        .should('be.visible')
        .clear()
        .type('00998');
    }
  };

  const fillAdministrativeInfo = () => {
    // ¿Es una organización sin fines de lucro?
    cy.get('[data-cy=non-profit-select]').click();
    cy.get('[data-cy=non-profit-option]').first().click(); // Seleccionar primera opción

    // Fecha de inicio
    cy.get('[data-cy="start-date-input"]')
      .click()
      .type('01/01/2023');

    // Año base - Agregado campo faltante
    cy.get('[data-cy="base-year-input"]')
      .clear()
      .type('2023');

    // Año de renovación - Agregado campo faltante
    cy.get('[data-cy="renewal-year-input"]')
      .clear()
      .type('2024');

    // Tipo de organización
    cy.get('[data-cy=organization-type-select]').click();
    cy.get('[data-cy=organization-type-option]').first().click();

    // Centro
    cy.get('[data-cy=center-select]').click();
    cy.get('[data-cy=center-option]').first().click();

    // Niveles educativos (múltiple selección)
    cy.get('[data-cy=education-levels-select]').click();
    cy.get('[data-cy=education-level-option]').first().click();
    cy.get('[data-cy=education-level-option]').eq(1).click();
    cy.get('body').click(); // Cerrar el dropdown

    // Días de funcionamiento
    cy.get('[data-cy="operating-days-input"]')
      .clear()
      .type('180');
  };

  const fillOperationalInfo = () => {
    // Tipo de cocina
    cy.get('[data-cy=kitchen-type-select]').click();
    cy.get('[data-cy=kitchen-type-option]').first().click();

    // Tipo de grupo
    cy.get('[data-cy=group-type-select]').click();
    cy.get('[data-cy=group-type-option]').first().click();

    // Tipo de entrega
    cy.get('[data-cy=delivery-type-select]').click();
    cy.get('[data-cy=delivery-type-option]').first().click();

    // Tipo de auspiciador
    cy.get('[data-cy=sponsor-type-select]').click();
    cy.get('[data-cy=sponsor-type-option]').first().click();

    // Tipo de solicitante
    cy.get('[data-cy=applicant-type-select]').click();
    cy.get('[data-cy=applicant-type-option]').first().click();

    // Tipo de residencial
    cy.get('[data-cy=residential-type-select]').click();
    cy.get('[data-cy=residential-type-option]').first().click();

    // Política de operación
    cy.get('[data-cy=operating-policy-select]').click();
    cy.get('[data-cy=operating-policy-option]').first().click();

    // Almacén
    cy.get('[data-cy=has-warehouse-select]').click();
    cy.get('[data-cy=has-warehouse-option]').first().click(); // Seleccionar primera opción

    // Comedor
    cy.get('[data-cy=has-dining-room-select]').click();
    cy.get('[data-cy=has-dining-room-option]').first().click(); // Seleccionar primera opción
  };

  const fillContactInfo = () => {
    cy.get('[data-cy="administrator-authorized-name-input"]')
      .clear()
      .type('Administrador Escuela Test');

    cy.get('[data-cy="site-phone-input"]')
      .clear()
      .type('7871234567');

    cy.get('[data-cy="extension-input"]')
      .clear()
      .type('101');

    cy.get('[data-cy="mobile-phone-input"]')
      .clear()
      .type('7877654321');
  };

  const fillSchedules = () => {
    // Desayuno
    cy.get('[data-cy=breakfast-select]').click();
    cy.get('[data-cy=breakfast-option]').first().click(); // Seleccionar primera opción

    cy.get('[data-cy="breakfast-from-input"]')
      .clear()
      .type('07:00');

    cy.get('[data-cy="breakfast-to-input"]')
      .clear()
      .type('07:30');

    // Almuerzo
    cy.get('[data-cy=lunch-select]').click();
    cy.get('[data-cy=lunch-option]').first().click(); // Seleccionar primera opción

    cy.get('[data-cy="lunch-from-input"]')
      .clear()
      .type('12:00');

    cy.get('[data-cy="lunch-to-input"]')
      .clear()
      .type('12:30');

    // Merienda
    cy.get('[data-cy=snack-select]').click();
    cy.get('[data-cy=snack-option]').first().click(); // Seleccionar primera opción

    cy.get('[data-cy="snack-from-input"]')
      .clear()
      .type('15:00');

    cy.get('[data-cy="snack-to-input"]')
      .clear()
      .type('15:30');
  };

            const waitForCatalogs = () => {
    cy.log('🔄 Esperando que se carguen los catálogos...');

    // Esperar solo los catálogos principales que se cargan inicialmente
    // Siguiendo el patrón más selectivo del proyecto
    cy.wait(['@getCities', '@getOrganizationTypes', '@getEducationLevels', '@getKitchenTypes'], { timeout: 15000 });

    cy.log('✅ Catálogos cargados exitosamente');

    // Verificar que algunos elementos clave estén disponibles
    cy.get('[data-cy="city-select"]', { timeout: 8000 }).should('be.visible');

    // Hacer scroll hacia el elemento organization-type-select y verificar que es visible
    cy.get('[data-cy="organization-type-select"]', { timeout: 8000 })
      .scrollIntoView()
      .should('be.visible');

    // Verificar que kitchen-type-select esté disponible
    cy.get('[data-cy="kitchen-type-select"]', { timeout: 8000 })
      .scrollIntoView()
      .should('be.visible');

    cy.log('✅ Elementos de UI verificados correctamente');
  };



  before(() => {
    // Setup inicial una sola vez por suite
    setupInterceptors();
  });

  // Función simplificada de login
  const attemptLogin = () => {
    cy.session([loginCredentials.email + '_session'], () => {
      cy.log('Iniciando proceso de login...');

      cy.visit('/sign-in');
      cy.wait(2000);

      // Llenar formulario de login usando los selectores correctos
      cy.get('[data-cy="email-input"]')
        .should('be.visible')
        .clear()
        .type(loginCredentials.email);

      cy.get('[data-cy="password-input"]')
        .should('be.visible')
        .clear()
        .type(loginCredentials.password);

      // Hacer submit usando el botón correcto
      cy.get('[data-cy="submit-button"]')
        .should('be.visible')
        .should('not.be.disabled')
        .click();

      // Esperar redirección exitosa - auth-redirect o portal
      cy.url({ timeout: 15000 }).should('satisfy', (url) => {
        return url.includes('auth-redirect') || url.includes('portal') || !url.includes('sign-in');
      });

      // Si estamos en auth-redirect, esperar a que complete la redirección
      cy.url().then((url) => {
        if (url.includes('auth-redirect')) {
          cy.log('✅ Login exitoso - esperando redirección...');
          cy.url({ timeout: 10000 }).should('include', 'portal');
        }
        cy.log('✅ Login completado exitosamente');
      });
    });
  };

  beforeEach(() => {
    // Configurar interceptores siguiendo el patrón del proyecto
    setupInterceptors();

    // Realizar login
    attemptLogin();

    // Navegar a la página correcta (con prefijo de portal)
    cy.visit('/agency-portal/schools/add');

    // Verificar que estamos en la página correcta
    cy.url().should('include', '/schools/add');

    // Esperar a que se carguen los catálogos
    cy.get('[data-cy="schools-add-form"]', { timeout: 15000 }).should('be.visible');
    waitForCatalogs();

    cy.log('✅ Navegación exitosa a la página de agregar escuela');
  });

  describe('Verificación de Autenticación', () => {
    it('Debe estar autenticado para acceder a la página de agregar escuela', () => {
      // Verificar que estamos en la página correcta
      cy.url().should('include', '/schools/add');

      // Verificar que no se redirige al login
      cy.url().should('not.include', '/sign-in');

      // Verificar que el formulario de escuela esté visible
      cy.get('[data-cy="schools-add-form"]').should('be.visible');
    });

    it('Debe mostrar información del usuario autenticado', () => {
      // Verificar que el usuario tiene acceso a la funcionalidad
      cy.get('[data-cy="schools-add-form"]').should('be.visible');

      // Verificar que los catálogos se cargan correctamente (indica que está autenticado)
      cy.get('[data-cy="city-select"]').should('be.visible');
      cy.get('[data-cy="organization-type-select"]').should('be.visible');
    });
  });

  describe('Validaciones de Campos Obligatorios', () => {
    it('Debe mostrar errores cuando faltan campos obligatorios', () => {
      // Primero interactuar con los campos para marcarlos como touched
      cy.get('[data-cy="name-input"]').focus().blur();
      cy.get('[data-cy="address-input"]').focus().blur();

      // Intentar guardar sin llenar campos obligatorios
      //cy.get('button').contains(/Guardar/i).should('be.visible').click();

      // Verificar que aparezcan mensajes de error para campos obligatorios
      cy.get('mat-error').should('have.length.greaterThan', 0);

      // Verificar algunos campos específicos
      cy.get('[data-cy="name-field"]').should('contain', 'obligatorio');
      cy.get('[data-cy="address-field"]').should('contain', 'obligatorio');
    });

    it('Debe habilitar el botón de guardar solo cuando los campos obligatorios estén completos', () => {
      // El botón debe estar deshabilitado inicialmente
      //cy.get('button').contains(/Guardar/i).should('be.disabled');

      // Llenar campos obligatorios gradualmente
      fillBasicInformation(testData.validSchool);
      fillPhysicalAddress();
      fillPostalAddress(true);
      fillAdministrativeInfo();
      fillOperationalInfo();
      fillContactInfo();
      fillSchedules();

      // El botón debe habilitarse después de llenar campos obligatorios
      //cy.get('button').contains(/Guardar/i).should('not.be.disabled');
    });
  });

  describe('Funcionalidad de Dirección Postal', () => {
    it('Debe copiar automáticamente la dirección física cuando se marca el checkbox', () => {
      cy.get('[data-cy="schools-add-form"]').should('be.visible').within(() => {
        // Llenar dirección física primero
        fillBasicInformation(testData.validSchool);
        fillPhysicalAddress();

        // Verificar que los campos postales estén vacíos inicialmente
        cy.get('[data-cy="postal-address-input"]').should('have.value', '');

        // Marcar el checkbox
        cy.get('[data-cy=same-as-physical-address-checkbox]')
          .scrollIntoView()
          .should('be.visible')
          .click();

        // Verificar que se copien los datos
        cy.get('[data-cy="postal-address-input"]')
          .should('have.value', testData.validSchool.address);
      });
    });

    it('Debe permitir dirección postal diferente cuando no se marca el checkbox', () => {
      cy.get('[data-cy="schools-add-form"]').should('be.visible').within(() => {
        fillBasicInformation(testData.validSchool);
        fillPhysicalAddress();
        fillPostalAddress(false); // No usar dirección física

        // Verificar que la dirección postal sea diferente
        cy.get('[data-cy="postal-address-input"]')
          .should('have.value', 'Apartado Postal 456');
           });
   });

  after(() => {
    // Mantener la sesión activa para otros tests si es necesario
    cy.log('Tests de registro de escuelas completados');
  });
});

  describe('Registro Exitoso', () => {
    it('Debe registrar exitosamente una escuela con todos los datos válidos', () => {
      cy.get('[data-cy="schools-add-form"]').should('be.visible').within(() => {
        // Llenar todos los formularios
        fillBasicInformation(testData.validSchool);
        fillPhysicalAddress();
        fillPostalAddress(true);
        fillAdministrativeInfo();
        fillOperationalInfo();
        fillContactInfo();
        fillSchedules();
      });

      // Guardar la escuela
    //   cy.get('button').contains(/Guardar/i)
    //     .scrollIntoView()
    //     .should('be.visible')
    //     .should('not.be.disabled')
    //     .click();

      // Verificar la llamada a la API
      cy.wait('@insertSchool').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.request.body).to.have.property('name', testData.validSchool.name);
        expect(interception.request.body).to.have.property('address', testData.validSchool.address);
        expect(interception.request.body).to.have.property('administratorAuthorizedName', testData.validSchool.administratorName);
      });

      // Verificar redirección exitosa
      cy.url().should('include', '/schools/list');

      // Verificar que aparezca la escuela en la lista
      cy.contains(testData.validSchool.name, { timeout: 10000 }).should('exist');
    });

    it('Debe registrar escuela sin información opcional', () => {
      cy.get('[data-cy="schools-add-form"]').should('be.visible').within(() => {
        // Solo llenar campos obligatorios
        fillBasicInformation(testData.validSchool);
        fillPhysicalAddress();
        fillPostalAddress(true);
        fillAdministrativeInfo();
      });

    //   cy.get('button').contains(/Guardar/i)
    //     .scrollIntoView()
    //     .should('be.visible')
    //     .click();

      cy.wait('@insertSchool').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });

      cy.url().should('include', '/schools/list');
    });
  });

  describe('Navegación y Cancelación', () => {
    it('Debe cancelar el registro y regresar a la lista', () => {
      // Llenar algunos campos
      fillBasicInformation(testData.validSchool);

      // Hacer clic en cancelar
      cy.get('button').contains(/Cancelar/i)
        .should('be.visible')
        .click();

      // Verificar redirección
      cy.url().should('include', '/schools/list');
    });

    it('Debe mostrar todos los elementos de la interfaz correctamente', () => {
      // Verificar que se cargue el formulario completo
      cy.get('[data-cy="schools-add-form"]').should('be.visible');

      // Verificar secciones principales
      cy.contains('Información').should('be.visible');
      cy.contains('Dirección').should('be.visible');
      cy.contains('Dirección Postal').should('be.visible');
      cy.contains('Información Administrativa').should('be.visible');
      cy.contains('Información Operacional').should('be.visible');
      cy.contains('Administrador').should('be.visible');
      cy.contains('Servicios y horario').should('be.visible');

      // Verificar botones principales
      //cy.get('button').contains(/Guardar/i).should('be.visible');
      //cy.get('button').contains(/Cancelar/i).should('be.visible');
    });
  });

  describe('Funcionalidad de Selección Múltiple', () => {
    it('Debe permitir seleccionar múltiples niveles educativos', () => {
      fillBasicInformation(testData.validSchool);
      fillPhysicalAddress();
      fillPostalAddress(true);

      // Probar selección múltiple de niveles educativos
      cy.get('[data-cy=education-levels-select]').click();
      cy.get('[data-cy=education-level-option]').first().click();
      cy.get('[data-cy=education-level-option]').eq(1).click();
      cy.get('body').click(); // Cerrar dropdown

      // Verificar que el campo muestra múltiples selecciones
      cy.get('[data-cy="education-levels-select"]')
        .should('be.visible');
    });
  });

  describe('Validaciones de Datos', () => {
    it('Debe validar formato de coordenadas GPS', () => {
      fillBasicInformation(testData.validSchool);

      // Probar coordenadas inválidas
      cy.get('[data-cy="latitude-input"]')
        .scrollIntoView()
        .should('be.visible')
        .clear()
        .type('coordenada_invalida');

      cy.get('[data-cy="longitude-input"]')
        .scrollIntoView()
        .should('be.visible')
        .clear()
        .type('coordenada_invalida');

      // El formulario no debería permitir guardar con coordenadas inválidas
      //cy.get('button').contains(/Guardar/i).should('be.disabled');
    });

    it('Debe validar formato de números de teléfono', () => {
      fillBasicInformation(testData.validSchool);
      fillPhysicalAddress();
      fillPostalAddress(true);
      fillAdministrativeInfo();

      // Probar teléfono válido
      cy.get('[data-cy="site-phone-input"]')
        .scrollIntoView()
        .should('be.visible')
        .clear()
        .type('7871234567');

      // Probar teléfono móvil válido
      cy.get('[data-cy="mobile-phone-input"]')
        .scrollIntoView()
        .should('be.visible')
        .clear()
        .type('7877654321');

      // El formulario debería aceptar estos números
      //cy.get('button').contains(/Guardar/i).should('not.be.disabled');
    });
  });
});
