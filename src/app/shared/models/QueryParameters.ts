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
  optionNamesExclude?: string;

  // Campos para actualización del estado activo de escuela
  schoolId?: number;
  isActive?: boolean;
  inactiveJustification?: string;

  // Campos para Staff
  staffId?: number;
  staffTypeId?: number;
}

