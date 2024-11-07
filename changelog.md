# Changelog

## [2024-10-01]

## Cambios Realizados

### Autenticación y Navegación
- Se agregó el método `getUserProgram()` en `AuthService` para obtener el programa del usuario.
- Se modificó la navegación para redirigir a `auth-redirect` en lugar de `validation-to-program`.

### Mejoras en el Componente de Edición
- Se añadieron nuevos campos en el formulario de edición: código postal y dirección postal.
- Se implementaron nuevas funcionalidades en el componente de edición:
  - `onSave()` para guardar cambios.
  - `onReject()` para rechazar aplicaciones.
  - `onSubmit()` para aprobar aplicaciones.

### Actualizaciones en Generic Header
- Se mejoró la configuración del `GenericHeader` para incluir nuevos botones de acción (Guardar y Rechazar).

### Mejoras en Generic Table
- Se agregó soporte para columnas combinadas en la tabla.
- Se mejoró el manejo de valores anidados en las columnas.

### Actualizaciones de Modelos
- Se actualizaron los modelos `Agency` y `AgencyRequest` para incluir nuevos campos relevantes.

### Servicios
- Se agregó el método `updateAgencyStatus` en `AgencyService` para actualizar el estado de una agencia.

### Internacionalización
- Se actualizaron los archivos de traducción (en.json y es.json) para reflejar los nuevos campos y etiquetas.

### Mejoras de UI/UX
- Se reorganizaron los campos en el formulario de edición para una mejor disposición.
- Se mejoró la interfaz de usuario con nuevos textos y etiquetas más descriptivas.

### Cambios en Pruebas
- Se actualizaron las pruebas de Cypress para reflejar los cambios en la navegación y la lógica de autenticación.

Estos cambios mejoran la funcionalidad y la usabilidad del sistema, asegurando una mejor experiencia para los usuarios.

## [2024-10-02]

## Cambios Realizados

### Componentes Genéricos
- Se realizaron arreglos en los componentes genéricos para mejorar la funcionalidad y la usabilidad.
- Se actualizaron las traducciones en los archivos de idioma para reflejar los cambios en la interfaz.

### Mejoras en el Componente de Edición
- Se mejoró la lógica de validación en el formulario de edición.
- Se añadieron placeholders en los campos de entrada para guiar al usuario.

### Actualizaciones en el Componente de Lista
- Se implementó paginación en la lista de validaciones de programas.
- Se mejoró la lógica de búsqueda y filtrado en la lista de agencias.

### Cambios en Servicios
- Se actualizaron los métodos en `AgencyService` para manejar mejor las solicitudes de actualización.
- Se agregó un nuevo método para actualizar el logo de una agencia.

### Mejoras de UI/UX
- Se mejoró la disposición de los elementos en la interfaz de usuario para una mejor experiencia.
- Se implementaron mensajes de confirmación más claros para las acciones del usuario.

### Cambios en Pruebas
- Se actualizaron las pruebas para reflejar los cambios en la lógica de los componentes y servicios.

Estos cambios buscan optimizar la experiencia del usuario y mejorar la funcionalidad general del sistema.

## [2024-11-04]

## Cambios Realizados

### Formularios de Agencias
- Se modificaron los formularios para permitir la selección de múltiples programas.
- Se implementó la nueva sintaxis de Angular 17 en los formularios.

### Mejoras en la Lógica de Validación
- Se mejoró la lógica de validación en el formulario de registro de auspiciadores.
- Se añadieron mensajes de error más claros para la elegibilidad en los programas.

### Actualizaciones en el Componente de Registro
- Se actualizaron los campos del formulario para incluir:
  - Dirección física
  - Dirección postal
  - Ciudad y región
  - Código postal
- Se implementó un checkbox para copiar la dirección física a la dirección postal.

### Cambios en Servicios
- Se actualizaron los métodos en `AuthService` para manejar múltiples programas.
- Se modificó el `CustomRouterService` para redirigir según el primer programa seleccionado.

### Mejoras de UI/UX
- Se mejoró la disposición de los elementos en los formularios para una mejor experiencia de usuario.
- Se implementaron descripciones en los campos del formulario para guiar al usuario.

### Cambios en Pruebas
- Se actualizaron las pruebas de Cypress para reflejar los cambios en la lógica de los formularios y la validación de programas.
- Se añadieron pruebas para verificar la funcionalidad del nuevo checkbox de dirección.

### Internacionalización
- Se actualizaron los archivos de traducción para incluir nuevos textos y descripciones relacionados con los cambios en los formularios.

## [2024-11-05]

## Cambios Realizados

### Mejoras en Componente de Edición
- Se actualizó el diseño responsive del formulario de edición
- Se agregaron nuevos campos en el formulario:
  - Latitud y longitud
  - Dirección postal completa (dirección, ciudad, región, código postal)
- Se mejoró la organización de secciones con títulos descriptivos
- Se implementó validación de tipos de entrada (number, email, tel)

### Mejoras en Componente de Lista
- Se implementó vista móvil para la tabla de agencias
- Se ocultó el paginador en vista móvil
- Se agregaron data-cy attributes para testing
- Se mejoró el manejo de la fuente de datos con dataSourceList

### Actualizaciones en Modelos
- Se actualizó el modelo Agency con nuevos campos:
  - Campos de dirección postal
  - IsActive e IsListable
  - Cambio de program a programs (array)
- Se actualizó AgencyRequest con nuevos campos de estado

### Mejoras en Testing
- Se actualizaron las pruebas de Cypress:
  - Se redujeron tiempos de espera
  - Se agregó cierre de menú de selección múltiple
  - Se comentó temporalmente test de registro exitoso

### Mejoras en UI/UX
- Se implementó diseño responsive en todos los componentes
- Se mejoró la presentación de datos en vista móvil
- Se actualizaron los estilos de headers y tablas
- Se agregaron mensajes de validación para selección de programas

### Internacionalización
- Se agregaron nuevas claves de traducción para mensajes de validación de programas

### Optimizaciones de Rendimiento
- Se mejoró el manejo de datos en GenericTable
- Se optimizó la carga de componentes en vista móvil

## [2024-11-06]

### Pruebas Cypress
- Se crearon dos nuevos archivos de prueba:
  - `Sponsor-Register-Fail.cy.js`: Pruebas de casos fallidos
  - `Sponsor-Register-Success.cy.js`: Pruebas de casos exitosos

### Pruebas de Registro Fallido
- Se implementaron pruebas para validar:
  - Notificación para organización con fines de lucro en PDAM/PSAV
  - Validación de fondos estatales denegados para PACNA
  - Validación de fondos federales denegados para PACNA
- Se agregaron verificaciones de:
  - Mensajes de error
  - Estado del botón de envío
  - Comportamiento de selección múltiple de programas

### Pruebas de Registro Exitoso
- Se implementó prueba completa de flujo de registro que incluye:
  - Selección de programas múltiples
  - Llenado de formulario con datos aleatorios usando faker
  - Validación de campos de dirección
  - Verificación de checkbox "Same as Physical Address"
  - Proceso de login post-registro
  - Búsqueda de agencia creada en la lista

### Mejoras en HTML
- Se actualizó la estructura del formulario en `edit.component.html`:
  - Mejora en la organización del grid
  - Optimización de espaciado
  - Ajustes en el layout responsive

### Optimizaciones
- Se redujeron tiempos de espera en las pruebas
- Se mejoró el manejo de intercepción de requests
- Se optimizó la estructura de los tests
- Se agregaron comentarios descriptivos en el código

### Validaciones
- Se implementaron validaciones para:
  - Elegibilidad de programas
  - Campos requeridos
  - Formato de datos
  - Estados de botones
