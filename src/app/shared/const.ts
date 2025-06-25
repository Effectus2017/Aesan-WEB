import { HttpHeaders, HttpParams } from '@angular/common/http';

// Aquí se guardan todas las constantes a ser utilizadas
export class Constants {
  // Se utiliza para mostrar fechas en español
  public static readonly SPANISH_FORMAT_DATE = 'dd/MM/yyyy';

  public static readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    observe: 'response' as 'body',
    params: null,
    body: null,
  };

  public static readonly httpExport: any = {
    headers: new HttpHeaders({
      'Content-Type': 'text/plain',
    }),
    responseType: 'text',
    observe: 'response' as 'body',
  };

  public static readonly httpText: any = {
    headers: new HttpHeaders({
      'Content-Type': 'text',
    }),
    responseType: 'text',
    observe: 'response' as 'body',
  };

  public static headersLogin: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    responseType: 'text',
    observe: 'response' as 'body',
  };

  public static headersUpload = {
    headers: new HttpHeaders({}),
    observe: 'response' as 'body',
  };

  public static headersExport: {
    headers?: HttpHeaders;
    observe?: 'body';
    params?: HttpParams;
    reportProgress?: boolean;
    responseType: 'arraybuffer';
    withCredentials?: boolean;
  } = {
    responseType: 'arraybuffer',
    observe: 'response' as 'body',
  };

}

// ================================================================================================
// PROGRAM CONSTANTS
// ================================================================================================

/**
 * Constantes para los IDs de programas
 * Constants for program IDs
 *
 * IMPORTANTE: Estos IDs deben coincidir con los IDs reales en la base de datos
 * IMPORTANT: These IDs must match the actual IDs in the database
 *
 * Basado en Programs-Table.sql:
 * 1 = PDAM/NSLBP, 2 = PSAV/SFSP, 3 = PACNA/CACFP, 4 = PFHF/FFVP, 5 = PDFE/F2S, 6 = AESAN, 7 = PAF/FFDP
 */
export const PROGRAM_IDS = {
  PDAM: 1,   // Programa de Desayuno Escolar / National School Lunch Program
  PSAV: 2,   // Programa de Servicios de Alimentos de Verano / Summer Food Service Program
  PACNA: 3,  // Programa de Alimentos para el Cuidado de Niños y Adulto / Child and Adult Care Food Program
  PFHF: 4,   // Programa de Frutas y Hortalizas Frescas / Free and Reduced Price School Meals Program
  PDFE: 5,   // Programa de la Finca a la Escuela / Farm to School Program
  AESAN: 6,  // Agencia de Servicios de Alimentos Nutritivos / Agency for Services of Nutritious Food
  PAF: 7     // Programa de Distribución de Alimentos Federales / Federal Foods Distribution Program (Inactivo)
} as const;

/**
 * Códigos de programa - estos nunca cambian independientemente del idioma
 * Program codes - these never change regardless of language
 *
 * IMPORTANTE: Usar estas constantes en lugar de strings literales
 * IMPORTANT: Use these constants instead of hardcoded strings
 */
export const PROGRAM_CODES = {
  PDAM: 'PDAM',
  PSAV: 'PSAV',
  PACNA: 'PACNA',
  PFHF: 'PFHF',
  PDFE: 'PDFE',
  AESAN: 'AESAN',
  PAF: 'PAF'
} as const;

/**
 * Helper function to get program code by ID
 * Función helper para obtener el código del programa por ID
 *
 * @param programId ID del programa
 * @returns Código del programa o null si no se encuentra
 *
 * @example
 * const code = getProgramCodeById(1); // returns 'PDAM'
 */
export function getProgramCodeById(programId: number): string | null {
  switch (programId) {
    case PROGRAM_IDS.PDAM:
      return PROGRAM_CODES.PDAM;
    case PROGRAM_IDS.PSAV:
      return PROGRAM_CODES.PSAV;
    case PROGRAM_IDS.PACNA:
      return PROGRAM_CODES.PACNA;
    case PROGRAM_IDS.PFHF:
      return PROGRAM_CODES.PFHF;
    case PROGRAM_IDS.PDFE:
      return PROGRAM_CODES.PDFE;
    case PROGRAM_IDS.AESAN:
      return PROGRAM_CODES.AESAN;
    case PROGRAM_IDS.PAF:
      return PROGRAM_CODES.PAF;
    default:
      return null;
  }
}

/**
 * Helper function to check if a program is of a specific type
 * Función helper para verificar si un programa es de un tipo específico
 *
 * @param program Objeto programa con propiedad id
 * @param expectedCode Código esperado del programa
 * @returns true si el programa es del tipo esperado
 *
 * @example
 * const isPDAM = isProgramOfType(selectedProgram, PROGRAM_CODES.PDAM);
 */
export function isProgramOfType(program: any, expectedCode: string): boolean {
  if (!program?.id) return false;
  const programCode = getProgramCodeById(program.id);
  return programCode === expectedCode;
}

/**
 * Helper function to check if a program is PSAV
 * Función helper para verificar si un programa es PSAV
 *
 * @param program Objeto programa con propiedad id
 * @returns true si es programa PSAV
 */
export function isPSAVProgram(program: any): boolean {
  return isProgramOfType(program, PROGRAM_CODES.PSAV);
}

/**
 * Helper function to check if a program is PDAM
 * Función helper para verificar si un programa es PDAM
 *
 * @param program Objeto programa con propiedad id
 * @returns true si es programa PDAM
 */
export function isPDAMProgram(program: any): boolean {
  return isProgramOfType(program, PROGRAM_CODES.PDAM);
}

/**
 * Helper function to check if a program is PACNA
 * Función helper para verificar si un programa es PACNA
 *
 * @param program Objeto programa con propiedad id
 * @returns true si es programa PACNA
 */
export function isPACNAProgram(program: any): boolean {
  return isProgramOfType(program, PROGRAM_CODES.PACNA);
}

/**
 * Helper function to check if a program is PFHF
 * Función helper para verificar si un programa es PFHF
 *
 * @param program Objeto programa con propiedad id
 * @returns true si es programa PFHF
 */
export function isPFHFProgram(program: any): boolean {
  return isProgramOfType(program, PROGRAM_CODES.PFHF);
}

/**
 * Helper function to check if a program is PDFE
 * Función helper para verificar si un programa es PDFE
 *
 * @param program Objeto programa con propiedad id
 * @returns true si es programa PDFE
 */
export function isPDFEProgram(program: any): boolean {
  return isProgramOfType(program, PROGRAM_CODES.PDFE);
}

/**
 * Helper function to check if a program is AESAN
 * Función helper para verificar si un programa es AESAN
 *
 * @param program Objeto programa con propiedad id
 * @returns true si es programa AESAN
 */
export function isAESANProgram(program: any): boolean {
  return isProgramOfType(program, PROGRAM_CODES.AESAN);
}

/**
 * Helper function to check if a program is PAF
 * Función helper para verificar si un programa es PAF
 *
 * @param program Objeto programa con propiedad id
 * @returns true si es programa PAF
 */
export function isPAFProgram(program: any): boolean {
  return isProgramOfType(program, PROGRAM_CODES.PAF);
}

/**
 * Helper function to check if a program is PDAM or PSAV
 * Función helper para verificar si un programa es PDAM o PSAV
 *
 * @param program Objeto programa con propiedad id
 * @returns true si es programa PDAM o PSAV
 */
export function isPDAMOrPSAVProgram(program: any): boolean {
  return isPDAMProgram(program) || isPSAVProgram(program);
}
