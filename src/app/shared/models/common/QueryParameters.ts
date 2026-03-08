export interface QueryParameters {
  take?: number;
  skip?: number;
  name?: string;
  names?: string;
  alls?: boolean;
  isList?: boolean;
  excludeRelated?: boolean;  // Nuevo parámetro para excluir staff ya relacionado
  id?: number;
  agencyId?: number;
  siteId?: number;
  programId?: number;
  regionId?: number;
  cityId?: number;
  statusId?: number;
  employeeId?: number;
  userId?: string;
  monitorId?: string;
  imageUrl?: string;
  rejectionJustification?: string;
  type?: string;
  fileName?: string;
  folderTo?: string;
  roles?: string[];
  /** Si true, get-all-roles-from-db devuelve solo roles AESAN (Name, DisplayName, DisplayNameEN). Con isList=true ese endpoint devuelve solo el array (sin { data, count }). */
  aesanOnly?: boolean;
  /** Excluir usuarios con rol Administrator o Super-Administrator (para dropdowns sin admins) */
  excludeAdministrators?: boolean;
  password?: string;
  newPassword?: string;
  temporaryPassword?: string;
  email?: string;
  token?: string;
  /**
   * Descripción del archivo que se está subiendo.
   * Ejemplos: "userProfile", "agencyDocument", "agencyLogo", etc.
   */
  description?: string;
  /**
   * Tipo de documento que se está subiendo.
   * Este campo representa una categorización o tipo de documento, no el tipo MIME del archivo.
   * Ejemplos: "contrato", "factura", "reporte", "certificado", etc.
   */
  documentType?: string;
  /**
   * Tamaño del archivo en bytes.
   * Se obtiene automáticamente del archivo subido usando file.Length
   */
  fileSize?: number;
  /**
   * Clave de la opción de selección.
   * Ejemplos: "yesNo", "exceptionStatus", "incomeFrequency", "taxExemptionType", "typeOfEntity", "typeOfApplicant"
   */
  optionKey?: string;
  /** Option keys a ordenar por nombre (según idioma). Separados por coma (ej. "community,experience"). */
  sortByNameKeys?: string;
  /** Option keys a ordenar por NameEN. Separados por coma. */
  sortByNameENKeys?: string;
  /** Idioma para sortByNameKeys: "en" usa NameEN, sino Name. */
  language?: string;
  optionNamesExclude?: string;

  // Campos para actualización del estado activo de escuela
  schoolId?: number;
  schoolCode?: string;
  isActive?: boolean;
  inactiveJustification?: string;
  inactiveDate?: string | null; // Formato YYYY-MM-DD (solo fecha, sin hora)
  providedRationsService?: boolean | null; // ¿Brindó servicio de raciones durante su periodo de funcionamiento?

  // Campos para Staff
  staffId?: number;
  staffTypeId?: number;
  groupTypeId?: number;
  staffClassificationName?: string;
  positionName?: string;
  comments?: string;

  // Campos para Permisos
  permissionId?: string; // Cambiado a string
  roleId?: string;
  stringId?: string; // Para IDs de tipo string (como Permission)
  valueKey?: string; // Para filtrar por ValueKey en permisos

  // ID del usuario actual logueado
  currentUserId?: string;

  // Campos para No traer agencias propietarias
  isPropietary?: boolean;

  // Campos para filtrar días de funcionamiento por mes y año
  month?: number; // Mes (1-12)
  year?: number;  // Año
  operatingDayId?: number; // ID del día de funcionamiento

  // Campo para filtrar sitios por IsDayCareHomeId (Sí, No, Ambos)
  isDayCareHomeId?: number | null;

  // Filtros lista validation-to-program (get-all-agencies-from-db)
  userFirstName?: string | null;
  statusName?: string | null;
  monitorFirstName?: string | null;
  createdAtFrom?: string | null;
  createdAtTo?: string | null;

  // Campo para filtrar templates de email por clave
  templateKey?: string;

  // Campos para actualizar fecha de registro completado
  AgencyId?: number; // ID de la agencia (con mayúscula para coincidir con backend)
  CompletedRegistrationDate?: string; // Fecha de registro completado en formato ISO

  // Campos para verificar existencia de identificadores de agencia
  uieNumber?: number | null; // Identificador Único de Entidad (IUE)
  sdrNumber?: number | null; // Número de Registro del Departamento de Estado (SDR)
  einNumber?: number | null; // Número de Seguro Social Patronal (EIN)

  // Centro de logs unificado (GET /api/logs)
  logCategory?: string; // Audit, Email, Job, Application
  logFrom?: string; // ISO date
  logTo?: string; // ISO date
  page?: number;
  pageSize?: number;
}
