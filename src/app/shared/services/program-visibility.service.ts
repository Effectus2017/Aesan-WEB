import { Injectable } from '@angular/core';
import {
  isPSAVProgram,
  isPDAMProgram,
  isPACNAProgram,
  isPFHFProgram,
  isPDFEProgram,
  isAESANProgram,
  isPAFProgram,
  isPDAMOrPSAVProgram,
  PROGRAM_IDS
} from 'app/shared/const';

export interface ProgramVisibilityConfig {
  // Para contexto de programa seleccionado (AuthSignUpComponent)
  selectedProgram?: any;

  // Para contexto de programas de agencia (AddSchoolComponent)
  agencyPrograms?: any[];

  // Configuración de campos
  fields: {
    [fieldName: string]: {
      showFor: number[]; // IDs de programas donde se muestra
      hideFor?: number[]; // IDs de programas donde se oculta (opcional)
      requiredFor?: number[]; // IDs de programas donde es requerido
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProgramVisibilityService {

  // Funciones helper expuestas para uso en templates
  readonly isPSAVProgram = isPSAVProgram;
  readonly isPDAMProgram = isPDAMProgram;
  readonly isPACNAProgram = isPACNAProgram;
  readonly isPFHFProgram = isPFHFProgram;
  readonly isPDFEProgram = isPDFEProgram;
  readonly isAESANProgram = isAESANProgram;
  readonly isPAFProgram = isPAFProgram;
  readonly isPDAMOrPSAVProgram = isPDAMOrPSAVProgram;
  readonly PROGRAM_IDS = PROGRAM_IDS;

  /**
   * Verifica si un campo debe mostrarse basado en programa seleccionado
   * Para contexto: AuthSignUpComponent
   */
  isFieldVisibleForSelectedProgram(fieldName: string, config: ProgramVisibilityConfig): boolean {
    if (!config.selectedProgram || !config.fields[fieldName]) {
      return false;
    }

    const fieldConfig = config.fields[fieldName];
    const programId = config.selectedProgram.id;

    // Verificar si debe ocultarse
    if (fieldConfig.hideFor?.includes(programId)) {
      return false;
    }

    // Verificar si debe mostrarse
    return fieldConfig.showFor.includes(programId);
  }

  /**
   * Verifica si un campo debe mostrarse basado en programas de agencia
   * Para contexto: AddSchoolComponent
   */
  isFieldVisibleForAgencyPrograms(fieldName: string, config: ProgramVisibilityConfig): boolean {
    if (!config.agencyPrograms?.length || !config.fields[fieldName]) {
      return false;
    }

    const fieldConfig = config.fields[fieldName];
    const agencyProgramIds = config.agencyPrograms.map(p => p.id);

    // Verificar si debe ocultarse para algún programa de la agencia
    if (fieldConfig.hideFor) {
      const hasHiddenProgram = agencyProgramIds.some(id => fieldConfig.hideFor!.includes(id));
      if (hasHiddenProgram) {
        return false;
      }
    }

    // Verificar si debe mostrarse para algún programa de la agencia
    return agencyProgramIds.some(id => fieldConfig.showFor.includes(id));
  }

  /**
   * Verifica si un campo es requerido basado en programa seleccionado
   */
  isFieldRequiredForSelectedProgram(fieldName: string, config: ProgramVisibilityConfig): boolean {
    if (!config.selectedProgram || !config.fields[fieldName]) {
      return false;
    }

    const fieldConfig = config.fields[fieldName];
    const programId = config.selectedProgram.id;

    return fieldConfig.requiredFor?.includes(programId) || false;
  }

  /**
   * Verifica si un campo es requerido basado en programas de agencia
   */
  isFieldRequiredForAgencyPrograms(fieldName: string, config: ProgramVisibilityConfig): boolean {
    if (!config.agencyPrograms?.length || !config.fields[fieldName]) {
      return false;
    }

    const fieldConfig = config.fields[fieldName];
    const agencyProgramIds = config.agencyPrograms.map(p => p.id);

    return agencyProgramIds.some(id => fieldConfig.requiredFor?.includes(id)) || false;
  }

  /**
   * Obtiene todos los campos visibles para un programa seleccionado
   */
  getVisibleFieldsForSelectedProgram(config: ProgramVisibilityConfig): string[] {
    if (!config.selectedProgram) {
      return [];
    }

    return Object.keys(config.fields).filter(fieldName =>
      this.isFieldVisibleForSelectedProgram(fieldName, config)
    );
  }

  /**
   * Obtiene todos los campos visibles para programas de agencia
   */
  getVisibleFieldsForAgencyPrograms(config: ProgramVisibilityConfig): string[] {
    if (!config.agencyPrograms?.length) {
      return [];
    }

    return Object.keys(config.fields).filter(fieldName =>
      this.isFieldVisibleForAgencyPrograms(fieldName, config)
    );
  }

  /**
   * Configuración predefinida para campos comunes
   */
  getCommonFieldConfig(): ProgramVisibilityConfig['fields'] {
    return {
      // Campos específicos para PSAV
      nationalYouthProgram: {
        showFor: [PROGRAM_IDS.PSAV]
      },

      // Campos específicos para PACNA
      isDayCareHome: {
        showFor: [PROGRAM_IDS.PACNA]
      },

      // Campos para PDAM y PSAV
      kitchenType: {
        showFor: [PROGRAM_IDS.PDAM, PROGRAM_IDS.PSAV]
      },
      groupType: {
        showFor: [PROGRAM_IDS.PDAM, PROGRAM_IDS.PSAV]
      },
      deliveryType: {
        showFor: [PROGRAM_IDS.PDAM, PROGRAM_IDS.PSAV]
      },

      // Campos específicos para PSAV
      community: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      walkers: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      siteType: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      experience: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      dinner: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      dinnerFrom: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      dinnerTo: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      snackNight: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      snackNightFrom: {
        showFor: [PROGRAM_IDS.PSAV]
      },
      snackNightTo: {
        showFor: [PROGRAM_IDS.PSAV]
      },

      // Campos específicos para PDAM
      organizationType: {
        showFor: [PROGRAM_IDS.PDAM]
      },
      centerType: {
        showFor: [PROGRAM_IDS.PDAM]
      },
      educationLevels: {
        showFor: [PROGRAM_IDS.PDAM]
      },
      operatingPolicy: {
        showFor: [PROGRAM_IDS.PDAM]
      }
    };
  }
}
