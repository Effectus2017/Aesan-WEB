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
