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

## [2024-11-19]

## Cambios Realizados

### Edición, Rechazo y Aprobación
- Se implementó la funcionalidad para rechazar agencias mediante un diálogo de justificación.
- Se agregó el componente `RejectDialogComponent` para capturar la razón del rechazo.
- Se mejoró la lógica en el método `onReject()` para mostrar el diálogo y manejar la justificación ingresada.

### Actualizaciones en el Componente de Edición
- Se importó `MatDialog` y `MatDialogModule` para el manejo de diálogos.
- Se eliminó el código comentado relacionado con la lógica de rechazo anterior.
- Se implementó la lógica para actualizar el estado de la agencia tras la justificación del rechazo.

### Internacionalización
- Se actualizaron los archivos de traducción (`en.json` y `es.json`) para incluir nuevos textos relacionados con el rechazo:
  - Títulos y mensajes para el diálogo de rechazo.
  - Mensajes de error y confirmación para el proceso de rechazo.

### Mejoras en la Interfaz de Usuario
- Se mejoró el diseño del diálogo de rechazo para una mejor experiencia de usuario.
- Se añadieron placeholders y descripciones en los campos del diálogo para guiar al usuario.

### Cambios en Pruebas
- Se realizaron ajustes en las pruebas para reflejar la nueva lógica de rechazo y la interacción con el diálogo.

## [2024-11-20] a [2024-12-07]

## Cambios Realizados

### Nuevos Componentes

- Componente para usaurios Monitores (Portal de Monitores segun el programa)
  - Ahora los usuarios Monitores pueden registrar visitas preoperacionales (en desarrollo)
  - Segun el tipo de Rol monitor va a portal correspondiente segun el programa que tenga asignado
- Componente para usaurios de Agencias (Portal de Agencias)
  - Ahora las agencias pueden registrar solicitudes de programas (en desarrollo)
  - Ahora las agencias pueden ver la lista de solicitudes de programas (en desarrollo)

- Cuando un usaurio sponsor se loguea, ssi aun tiene password temporal, se le pedira que cambie su password

### Mejoras en Componentes de Edición
- Se unificó la lógica de guardado en los componentes:
  - `EditValidationToProgramComponent`
  - `EditMonitorPreoperationalVisitComponent`
  - `EditProgramRequestComponent`
- Se implementó manejo consistente de formularios y validaciones
- Se agregó deshabilitación del formulario durante el guardado
- Se mejoró el manejo de errores y mensajes de confirmación
- Se implementó validación de campos requeridos antes del guardado
- Se agregó soporte para múltiples programas en el formulario

### Actualizaciones en Servicios
- Se actualizó `AgencyService` para manejar:
  - Actualización de estado de agencia
  - Actualización de programas
  - Obtención de datos de agencia
- Se implementó manejo de parámetros de consulta consistente
- Se mejoró el manejo de respuestas del servidor
- Se agregó actualización automática de datos después del guardado

### Mejoras en la Interfaz de Usuario
- Se agregaron diálogos de confirmación para:
  - Éxito en guardado
  - Errores en operaciones
  - Rechazo de agencias
- Se implementaron mensajes traducidos para todos los diálogos
- Se mejoró la experiencia de usuario durante operaciones asíncronas
- Se agregaron indicadores visuales durante el guardado
- Se implementó diseño responsive para todos los componentes
- Se mejoró la presentación de datos en vista móvil

### Optimizaciones de Código
- Se eliminó código comentado obsoleto
- Se mejoró el manejo de tipos en las interfaces
- Se implementó manejo consistente de suscripciones
- Se agregaron comentarios descriptivos en métodos clave
- Se optimizó la estructura de los componentes
- Se mejoró el manejo de estados del formulario

### Internacionalización
- Se actualizaron las traducciones para:
  - Mensajes de error
  - Diálogos de confirmación
  - Etiquetas de formularios
  - Mensajes de validación
- Se implementó soporte multiidioma para nuevos componentes

### Testing
- Se actualizaron las pruebas de Cypress para:
  - Validación de formularios
  - Flujos de guardado
  - Manejo de errores
  - Interacciones de usuario
- Se optimizaron los tiempos de espera en las pruebas
- Se agregaron nuevos casos de prueba para validaciones
### Documentación
- Se actualizaron los comentarios en el código para mejor claridad
- Se documentaron los nuevos métodos y componentes
- Se agregaron ejemplos de uso en los comentarios

# Changelog - [2024-12-08] a [2025-01-07]

## Cambios Realizados

### Nuevos Componentes y Funcionalidades
- Se implementó el Portal de Monitores con:
  - Registro de visitas preoperacionales
  - Redirección según rol y programa asignado
- Se implementó el Portal de Agencias con:
  - Registro de solicitudes de programas
  - Visualización de lista de solicitudes
- Se agregó solicitud de cambio de contraseña para usuarios sponsors con contraseña temporal

### Mejoras en Componentes de Edición
- Se unificó la lógica de guardado en:
  - `EditValidationToProgramComponent`
  - `EditMonitorPreoperationalVisitComponent`
  - `EditProgramRequestComponent`
- Se implementó manejo consistente de formularios y validaciones
- Se agregó deshabilitación del formulario durante el guardado
- Se mejoró el manejo de errores y mensajes de confirmación

### Actualizaciones en Servicios
- Se mejoró `AgencyService` para:
  - Actualización de estado de agencia
  - Actualización de programas
  - Obtención de datos de agencia
- Se implementó manejo consistente de parámetros de consulta

### Nuevos Modelos
- Se crearon nuevas interfaces:
  - `EducationLevel`
  - `Facility`
  - `MealType`
  - `OperatingPeriod`
  - `OrganizationType`
  - `SchoolRequest`
  - `School`

### Mejoras en UI/UX
- Se agregaron diálogos de confirmación para:
  - Éxito en guardado
  - Errores en operaciones
  - Rechazo de agencias
- Se implementaron mensajes traducidos
- Se mejoró la experiencia durante operaciones asíncronas
- Se implementó diseño responsive

### Componentes Eliminados
- Se eliminaron componentes obsoletos:
  - `BudgetComponent`
  - `DocumentsComponent`
  - `RefundsComponent`
  - Sus respectivos servicios y rutas

### Internacionalización
- Se actualizaron traducciones para:
  - Mensajes de error
  - Diálogos de confirmación
  - Etiquetas de formularios
  - Mensajes de validación
- Se implementó soporte multiidioma para nuevos componentes

### Optimizaciones
- Se eliminó código comentado obsoleto
- Se mejoró el manejo de tipos en interfaces
- Se implementó manejo consistente de suscripciones
- Se agregaron comentarios descriptivos
- Se cambió el título de la aplicación de "AESAN" a "NUTRE"

### Testing
- Se actualizaron pruebas de Cypress
- Se optimizaron tiempos de espera
- Se agregaron nuevos casos de prueba para validaciones

# Changelog - [2025-01-08]

## Cambios Realizados

### Nuevos Componentes y Funcionalidades
- Se implementó el Portal de Monitores con:
  - Registro de visitas preoperacionales
  - Redirección según rol y programa asignado
- Se implementó el Portal de Agencias con:
  - Registro de solicitudes de programas
  - Visualización de lista de solicitudes
- Se agregó solicitud de cambio de contraseña para usuarios sponsors con contraseña temporal

### Mejoras en Componentes de Edición
- Se unificó la lógica de guardado en:
  - `EditValidationToProgramComponent`
  - `EditMonitorPreoperationalVisitComponent` 
  - `EditProgramRequestComponent`
- Se implementó manejo consistente de formularios y validaciones
- Se agregó deshabilitación del formulario durante el guardado
- Se mejoró el manejo de errores y mensajes de confirmación

### Actualizaciones en Servicios
- Se actualizó `AgencyService` para:
  - Actualización de estado de agencia
  - Actualización de programas
  - Obtención de datos de agencia
- Se implementó manejo consistente de parámetros de consulta

### Nuevos Modelos
- Se crearon nuevas interfaces:
  - `EducationLevel`
  - `Facility` 
  - `MealType`
  - `OperatingPeriod`
  - `OrganizationType`
  - `SchoolRequest`
  - `School`

### Mejoras en UI/UX
- Se agregaron diálogos de confirmación para:
  - Éxito en guardado
  - Errores en operaciones 
  - Rechazo de agencias
- Se implementaron mensajes traducidos
- Se mejoró la experiencia durante operaciones asíncronas
- Se implementó diseño responsive

### Componentes Eliminados
- Se eliminaron componentes obsoletos:
  - `BudgetComponent`
  - `DocumentsComponent`
  - `RefundsComponent`
  - Sus respectivos servicios y rutas

### Internacionalización
- Se actualizaron traducciones para:
  - Mensajes de error
  - Diálogos de confirmación
  - Etiquetas de formularios
  - Mensajes de validación
- Se implementó soporte multiidioma para nuevos componentes

### Optimizaciones
- Se eliminó código comentado obsoleto
- Se mejoró el manejo de tipos en interfaces
- Se implementó manejo consistente de suscripciones
- Se agregaron comentarios descriptivos
- Se cambió el título de la aplicación de "AESAN" a "NUTRE"

### Testing
- Se actualizaron pruebas de Cypress
- Se optimizaron tiempos de espera
- Se agregaron nuevos casos de prueba para validaciones

# Changelog - [2025-01-09] a [2025-02-07]

## Cambios Realizados

### Mejoras en el Registro de Auspiciadores
- Se actualizó el flujo de registro para simplificar la selección de programas:
  - Se modificó para permitir selección única de programa PDAM
  - Se eliminó la opción de selección múltiple de programas (PSAV)
- Se mejoró la validación de campos numéricos:
  - Se implementó la directiva `NumericOnlyDirective` para:
    - UIE Number
    - State Department Registration Number
    - EIN Number
    - Zip Code
  - Se agregó validación de pegado para asegurar solo entrada numérica

### Actualizaciones en Modelos
- Se actualizaron los modelos de datos geográficos:
  - `City`: Nuevos campos IsActive, CreatedAt, UpdatedAt
  - `Region`: Nuevos campos IsActive, CreatedAt, UpdatedAt
  - Se agregó nuevo modelo `CityRegion` para manejar relaciones ciudad-región

### Mejoras en Servicios
- Se expandió `GeoService` con nuevas funcionalidades:
  - Método para obtener ciudades por ID de región
  - Método para obtener relaciones ciudad-región
  - Soporte para observables de CityRegion

### Mejoras en la Interfaz de Usuario
- Se reorganizó el flujo de selección de ubicación:
  - Primero se selecciona la región
  - Luego se selecciona la ciudad basada en la región
- Se agregó botón de búsqueda de coordenadas GPS con tooltip
- Se mejoró la organización de campos de dirección postal

### Optimizaciones
- Se agregaron nuevas utilidades en `utils.ts`:
  - `disableAllControlsExcept()` para deshabilitar controles del formulario
  - `enableAllControls()` para habilitar controles del formulario
- Se actualizó el pipeline de desarrollo para usar `npm run prod` en lugar de `npm run dev`

### Internacionalización
- Se agregaron nuevas traducciones:
  - Tooltip para búsqueda de coordenadas GPS en español e inglés
  - Mensajes de validación actualizados

### Testing
- Se actualizaron las pruebas de Cypress para el registro de auspiciadores:
  - Se ajustó el flujo de selección de programa
  - Se actualizó la secuencia de selección región-ciudad
  - Se agregaron validaciones para campos numéricos

### Correcciones de Bugs
- Se corrigió el acceso a propiedades de ciudad y región (cambio de `id` a `Id`)
- Se mejoró el manejo de estados en formularios durante la validación
