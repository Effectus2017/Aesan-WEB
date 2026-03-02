export interface UserToken {
    id: string;
    name: string;

    avatar?: string;
    status?: string;

    unique_name?: string;
    email?: string;
    role?: string;
    nameid?: string;
    nbf?: number;
    exp?: number;
    iat?: number;
  }

  /** Rol secundario con vigencia (para enviar a la API) */
  export interface SecondaryRoleInput {
    roleName: string;
    comment?: string;
    validFrom: string;
    validTo: string;
  }

  /** Fila del formulario de roles secundarios (FormArray value). Usar en lugar de tipos inline. */
  export interface SecondaryRoleFormRow {
    role: DTORole | null;
    comment?: string | null;
    validFrom?: string | Date | null;
    validTo?: string | Date | null;
  }

  export interface RequestUser {
    id?: string;
    firstName?: string;
    middleName?: string;
    fatherLastName?: string;
    motherLastName?: string;
    userName?: string;
    email?: string;
    password?: string;
    role?: any;
    roles?: any;
    /** Rol principal (un solo nombre). Si se envía, la API usa flujo primary + secondary. */
    primaryRoleName?: string;
    /** Roles secundarios con fechas. Solo usado cuando primaryRoleName está definido. */
    secondaryRoles?: SecondaryRoleInput[];
    imageURL?: string;
    agencyId?: number;
    isActive?: boolean;
    isTemporalPasswordActived?: boolean;
    emailConfirmed?: boolean;
    /** Un solo programa (compatibilidad). Preferir programIds. */
    programId?: number;
    programName?: string;
    /** Lista de IDs de programas asignados al usuario (Admin Portal). */
    programIds?: number[];
    /** ID de ciudad para el registro Staff al crear usuario. */
    cityId?: number;
    /** ID de región para el registro Staff al crear usuario. */
    regionId?: number;
  }

  export interface Token {
    token_type: string;
    access_token: string;
    expires_in: number;
    refresh_token: string;
  }

  /**
   * Modelo de rol de usuario.
   * 
   * @property id - Identificador único del rol (GUID)
   * @property name - Clave técnica del rol (ej: "administrator", "program_coordinator"). 
   *                  Se usa como identificador en lógica de negocio y como value en selects.
   * @property displayName - Nombre legible del rol en español para mostrar al usuario (ej: "Administrador", "Coordinador de Programa")
   * @property displayNameEN - Nombre legible del rol en inglés para mostrar al usuario (ej: "Administrator", "Program Coordinator")
   * 
   * Nota: Los campos vienen del backend en lowercase (name, displayname, displaynameen) y se normalizan a camelCase.
   */
  export interface DTORole {
    id?: string;
    name?: string;
    displayName?: string;
    displayNameEN?: string;
  }

  /** Datos de entrada del modal de agregar/editar rol secundario. */
  export interface AddSecondaryRoleModalData {
    /** Lista de roles disponibles (ya filtrada por el backend sin rol primario ni roles ya asignados) */
    listRoles: DTORole[];
    /** Datos del rol a editar (opcional, solo para modo edición) */
    editRow?: { role: DTORole | null; validFrom: string | null; validTo: string | null; index: number };
  }

  /** Resultado al cerrar el modal de agregar/editar rol secundario. */
  export interface AddSecondaryRoleModalResult {
    role: DTORole;
    validFrom: string | null;
    validTo: string | null;
  }

  /** Fila de rol secundario con role y fechas (retorno de getSecondaryRolesFromUser). */
  export interface SecondaryRoleFromUserRow {
    role: DTORole | null;
    validFrom: string | null;
    validTo: string | null;
  }

  /** Item de secondary role tal como viene del usuario (campos opcionales). */
  export interface UserSecondaryRoleStub {
    roleName?: string;
    comment?: string;
    validFrom?: string;
    validTo?: string;
  }

  /** Programa para select (id + name según idioma: name / nameEN). */
  export interface ProgramOption {
    id: number;
    name: string;
    nameEN?: string;
  }

  /** Agencia para select (id + name). */
  export interface AgencyOption {
    id: number;
    name: string;
  }

  /** Item de agencia tal como viene del API (puede tener Name en PascalCase). */
  export interface AgencyListItem {
    id?: number;
    name?: string;
    Name?: string;
  }

  /** Fila de la tabla de roles secundarios en add/edit. */
  export interface SecondaryRoleTableRow {
    id: number;
    roleName: string;
    validFrom: string;
    validTo: string;
  }

  export interface ChangePassword {
    email?: string;
    id?: string;
    newPassword?: string;
    password?: string;
  }

  export interface GeneratePassword {
    email: string;
  }

  export interface ResetPassword {
    token: string;
    userId: string;
  }

  /** Valor del formulario de alta de usuario. Evita tipos inline en submitForm. */
  export interface AddUserFormValue {
    username?: string | null;
    currentPassword?: string | null;
    newPassword?: string | null;
    email?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    fatherLastName?: string | null;
    motherLastName?: string | null;
    role?: DTORole | null;
    secondaryRoles?: SecondaryRoleFormRow[];
    agency?: AgencyOption | null;
    programs?: ProgramOption[];
    city?: { id: number; name?: string } | null;
    region?: { id: number; name?: string } | null;
    isActive?: boolean;
    isTemporalPasswordActived?: boolean;
    emailConfirmed?: boolean;
  }

  /** Errores de validación usados en add/edit usuario (evitar literales inline). */
  export interface RequiredValidationError {
    required: true;
  }

  export interface PasswordNotMatchValidationError {
    passwordNotMatch: true;
  }

  export interface InvalidEmailFormatValidationError {
    invalidEmailFormat: true;
  }

  export interface DateRangeValidationError {
    dateRange: true;
  }

  /** Opciones iniciales del FormControl de username (disabled hasta rellenar email). */
  export interface FormControlDisabledOptions {
    value: null;
    disabled: true;
  }

  /** Respuesta mínima del endpoint add user (para tipar callback next). */
  export interface AddUserResponse {
    status?: number;
  }

  /** Colores de icono admitidos por FuseConfirmationService. */
  export type FuseConfirmationIconColor = 'error' | 'warn' | 'primary' | 'accent' | 'basic' | 'info' | 'success' | 'warning';

  /** Colores de acción confirm admitidos por FuseConfirmationService. */
  export type FuseConfirmationActionColor = 'warn' | 'primary' | 'accent';

  /** Opciones del diálogo de confirmación Fuse usadas en add usuario (evitar literales inline). */
  export interface FuseConfirmationDialogOptions {
    title: string;
    message: string;
    icon: { show: boolean; name: string; color: FuseConfirmationIconColor };
    actions: {
      confirm: { show: boolean; label: string; color: FuseConfirmationActionColor };
      cancel: { show: boolean; label?: string };
    };
  }
