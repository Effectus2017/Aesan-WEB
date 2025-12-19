import { Injectable } from '@angular/core';
import fieldConfig from '../../modules/agency-portal/staff/edit-board-member/field-visibility-config.json';
import sitesFieldConfig from '../../modules/agency-portal/sites-pdam/field-visibility-config.json';
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

export interface FieldVisibilityConfig {
  showFor: string[];
  hideFor: string[];
  requiredFor: string[];
  optionalFor: string[];
  // Propiedades para roles y permisos
  roles?: string[];
  permissions?: string[];
  // ✅ NUEVO: Propiedades para programas
  showForPrograms?: number[]; // IDs de programas donde se muestra
  hideForPrograms?: number[]; // IDs de programas donde se oculta
  requiredForPrograms?: number[]; // IDs de programas donde es requerido
}

export interface EntityTypeConfig {
  id: number;
  names: string[];
  [key: string]: any; // Permite propiedades adicionales específicas del formulario
}

export interface FormConfig {
  fieldVisibility: { [fieldName: string]: FieldVisibilityConfig };
  [key: string]: any; // Permite configuraciones adicionales específicas del formulario
}

export interface RoleConfig {
  id: number;
  name: string;
  level: number;
  permissions: string[];
}

export interface PermissionConfig {
  id: number;
  name: string;
  description: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class FieldVisibilityService {
  private fieldConfigs: Map<string, any> = new Map();
  private currentConfig: any = null;

  // Propiedades para roles y permisos del usuario actual
  private currentUserRole: string = '';
  private currentUserPermissions: string[] = [];

  // ✅ NUEVO: Funciones helper para programas (como en AuthSignUpComponent)
  readonly isPSAVProgram = isPSAVProgram;
  readonly isPDAMProgram = isPDAMProgram;
  readonly isPACNAProgram = isPACNAProgram;
  readonly isPFHFProgram = isPFHFProgram;
  readonly isPDFEProgram = isPDFEProgram;
  readonly isAESANProgram = isAESANProgram;
  readonly isPAFProgram = isPAFProgram;
  readonly isPDAMOrPSAVProgram = isPDAMOrPSAVProgram;
  readonly PROGRAM_IDS = PROGRAM_IDS;

  constructor() {
    //console.log('🔧 FieldVisibilityService constructor');
    //console.log('🔧 fieldConfig import:', fieldConfig);

    // Cargar las configuraciones por defecto
    this.loadConfig('staff', fieldConfig);
    this.loadConfig('sites', sitesFieldConfig);
    //console.log('🔧 Configuración cargada, fieldConfigs size:', this.fieldConfigs.size);
  }

  /**
   * Carga una configuración específica para un formulario
   */
  loadConfig(configName: string, config: any): void {
    this.fieldConfigs.set(configName, config);
  }

  /**
   * Establece la configuración activa para el formulario actual
   */
  setActiveConfig(configName: string): boolean {
    //console.log(`🔧 FieldVisibilityService.setActiveConfig(${configName})`);
    //console.log('🔧 fieldConfigs keys:', Array.from(this.fieldConfigs.keys()));

    if (this.fieldConfigs.has(configName)) {
      this.currentConfig = this.fieldConfigs.get(configName);
      //console.log('🔧 Configuración activa establecida:', this.currentConfig);
      return true;
    }

    //console.log('🔧 Configuración no encontrada:', configName);
    return false;
  }

  /**
   * Establece el rol y permisos del usuario actual
   */
  setCurrentUser(role: string, permissions: string[]): void {
    this.currentUserRole = role;
    this.currentUserPermissions = permissions;
  }

  /**
   * Establece solo el rol del usuario actual
   */
  setCurrentUserRole(role: string): void {
    this.currentUserRole = role;
  }

  /**
   * Establece solo los permisos del usuario actual
   */
  setCurrentUserPermissions(permissions: string[]): void {
    this.currentUserPermissions = permissions;
  }

  /**
   * Obtiene la configuración activa actual
   */
  private getActiveConfig(): any {
    return this.currentConfig;
  }

  /**
   * Determina si un campo debe ser visible para un tipo de entidad específico
   */
  shouldShowField(fieldName: string, entityType: string): boolean {
    //console.log(`🔍 FieldVisibilityService.shouldShowField(${fieldName}, ${entityType})`);

    const config = this.getActiveConfig();
    //console.log('🔍 Config:', config);

    if (!config) {
      //console.log('🔍 No hay configuración activa, mostrando campo por defecto');
      return true; // Por defecto mostrar si no hay configuración
    }

    const field = config.fieldVisibility[fieldName];
    //console.log('🔍 Field config:', field);

    if (!field) {
      //console.log('🔍 No hay configuración del campo, mostrando por defecto');
      return true; // Por defecto mostrar si no hay configuración del campo
    }

    // Verificar visibilidad por tipo de entidad
    const entityTypeVisible = field.showFor.includes(entityType);
    //console.log(`🔍 Entity type visible: ${entityTypeVisible}, showFor: ${field.showFor}, entityType: ${entityType}`);

    // Si no es visible por tipo de entidad, no mostrar
    if (!entityTypeVisible) {
      //console.log('🔍 Campo no visible por tipo de entidad');
      return false;
    }

    // Verificar visibilidad por rol y permisos
    const rolePermissionVisible = this.checkRoleAndPermissionVisibility(field);
    //console.log(`🔍 Role/permission visible: ${rolePermissionVisible}`);

    return rolePermissionVisible;
  }

    /**
   * Verifica la visibilidad basada en roles y permisos
   */
  private checkRoleAndPermissionVisibility(field: FieldVisibilityConfig): boolean {
    //console.log('🔍 checkRoleAndPermissionVisibility - field:', field);
    //console.log('🔍 currentUserRole:', this.currentUserRole, 'currentUserPermissions:', this.currentUserPermissions);

    // Si no hay configuración de roles/permisos, mostrar
    if (!field.roles && !field.permissions) {
      //console.log('🔍 No hay configuración de roles/permisos, mostrando campo');
      return true;
    }

    // Verificar roles específicos
    if (field.roles && field.roles.length > 0) {
      if (!field.roles.includes(this.currentUserRole)) {
        //console.log(`🔍 Rol no autorizado: ${this.currentUserRole} no está en ${field.roles}`);
        return false;
      }
    }

    // Verificar permisos específicos
    if (field.permissions && field.permissions.length > 0) {
      const hasRequiredPermission = field.permissions.some(permission =>
        this.currentUserPermissions.includes(permission)
      );
      if (!hasRequiredPermission) {
        //console.log(`🔍 Permisos insuficientes: ${this.currentUserPermissions} no incluye ${field.permissions}`);
        return false;
      }
    }

    //console.log('🔍 Campo visible por roles y permisos');
    return true;
  }

  /**
   * Determina si un campo es requerido para un tipo de entidad específico
   */
  isFieldRequired(fieldName: string, entityType: string): boolean {
    const config = this.getActiveConfig();
    if (!config) return false;

    const field = config.fieldVisibility[fieldName];
    if (!field) return false;

    return field.requiredFor.includes(entityType);
  }

  /**
   * Determina si un campo es opcional para un tipo de entidad específico
   */
  isFieldOptional(fieldName: string, entityType: string): boolean {
    const config = this.getActiveConfig();
    if (!config) return false;

    const field = config.fieldVisibility[fieldName];
    if (!field) return false;

    return field.optionalFor.includes(entityType);
  }

  /**
   * Obtiene la configuración de un campo específico
   */
  getFieldConfig(fieldName: string): FieldVisibilityConfig | null {
    const config = this.getActiveConfig();
    if (!config) return null;

    return config.fieldVisibility[fieldName] || null;
  }

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.currentUserRole === role;
  }



  /**
   * Verifica si el usuario actual tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    return this.currentUserPermissions.includes(permission);
  }

  /**
   * Verifica si el usuario actual tiene al menos uno de los permisos especificados
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.currentUserPermissions.includes(permission));
  }

  /**
   * Verifica si el usuario actual tiene todos los permisos especificados
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.currentUserPermissions.includes(permission));
  }

  /**
   * Obtiene el rol actual del usuario
   */
  getCurrentUserRole(): string {
    return this.currentUserRole;
  }



  /**
   * Obtiene los permisos actuales del usuario
   */
  getCurrentUserPermissions(): string[] {
    return [...this.currentUserPermissions];
  }

  /**
   * Obtiene la configuración completa del formulario activo
   */
  getFormConfig(): any {
    return this.getActiveConfig();
  }

  /**
   * Obtiene la configuración de un tipo de entidad específico
   */
  getEntityTypeConfig(entityTypeName: string): EntityTypeConfig | null {
    const config = this.getActiveConfig();
    if (!config) return null;

    // Buscar en todas las configuraciones de tipos de entidad del formulario
    for (const key of Object.keys(config)) {
      if (key.endsWith('Types') || key.endsWith('Statuses') || key.endsWith('Roles')) {
        const entityTypes = config[key];
                const entityType = Object.values(entityTypes)
          .find((et: any) => {
            const typedEt = et as EntityTypeConfig;
            return typedEt.names && Array.isArray(typedEt.names) && typedEt.names.includes(entityTypeName);
          });

        if (entityType) return entityType as EntityTypeConfig;
      }
    }

    return null;
  }

  /**
   * Obtiene el ID del tipo de entidad basado en el nombre
   */
  getEntityTypeId(entityTypeName: string): number | null {
    const config = this.getEntityTypeConfig(entityTypeName);
    return config ? config.id : null;
  }

  /**
   * Determina si un tipo de entidad es de un tipo específico
   */
  isEntityType(entityTypeName: string, targetType: string): boolean {
    const config = this.getActiveConfig();
    if (!config) return false;

    // Buscar en todas las configuraciones de tipos de entidad del formulario
    for (const key of Object.keys(config)) {
      if (key.endsWith('Types') || key.endsWith('Statuses') || key.endsWith('Roles')) {
        const entityTypes = config[key];
        if (entityTypes[targetType]) {
          const targetConfig = entityTypes[targetType] as EntityTypeConfig;
          return targetConfig.names && Array.isArray(targetConfig.names) && targetConfig.names.includes(entityTypeName);
        }
      }
    }

    return false;
  }

  /**
   * Obtiene el tipo de entidad basado en el nombre
   */
  getEntityTypeFromName(entityTypeName: string): string | null {
    const config = this.getActiveConfig();
    if (!config) return null;

    // Buscar en todas las configuraciones de tipos de entidad del formulario
    for (const key of Object.keys(config)) {
      if (key.endsWith('Types') || key.endsWith('Statuses') || key.endsWith('Roles')) {
        const entityTypes = config[key];
        for (const [typeKey, typeConfig] of Object.entries(entityTypes)) {
          const typedConfig = typeConfig as EntityTypeConfig;
          if (typedConfig.names && Array.isArray(typedConfig.names) && typedConfig.names.includes(entityTypeName)) {
            return typeKey;
          }
        }
      }
    }

    return null;
  }

  /**
   * Obtiene todos los tipos de entidad disponibles para el formulario activo
   */
  getAvailableEntityTypes(): string[] {
    const config = this.getActiveConfig();
    if (!config) return [];

    const entityTypes: string[] = [];

    // Buscar en todas las configuraciones de tipos de entidad del formulario
    for (const key of Object.keys(config)) {
      if (key.endsWith('Types') || key.endsWith('Statuses') || key.endsWith('Roles')) {
        const entityTypesConfig = config[key];
        entityTypes.push(...Object.keys(entityTypesConfig));
      }
    }

    return entityTypes;
  }

  /**
   * Obtiene la configuración de un campo específico con información adicional
   */
  getFieldConfigWithMetadata(fieldName: string): {
    config: FieldVisibilityConfig | null;
    isVisible: boolean;
    isRequired: boolean;
    isOptional: boolean;
  } | null {
    const config = this.getFieldConfig(fieldName);
    if (!config) return null;

    return {
      config,
      isVisible: true, // Por defecto visible
      isRequired: false, // Por defecto no requerido
      isOptional: false // Por defecto no opcional
    };
  }

  /**
   * Valida si la configuración del formulario activo es válida
   */
  validateFormConfig(): boolean {
    const config = this.getActiveConfig();
    if (!config || !config.fieldVisibility) return false;

    // Verificar que todos los campos tengan configuración válida
    for (const [fieldName, fieldConfig] of Object.entries(config.fieldVisibility)) {
      const field = fieldConfig as FieldVisibilityConfig;
      if (!field.showFor || !Array.isArray(field.showFor)) return false;
      if (!field.hideFor || !Array.isArray(field.hideFor)) return false;
      if (!field.requiredFor || !Array.isArray(field.requiredFor)) return false;
      if (!field.optionalFor || !Array.isArray(field.optionalFor)) return false;
    }

    return true;
  }

  /**
   * Obtiene todos los campos configurados en el formulario activo
   */
  getConfiguredFields(): string[] {
    const config = this.getActiveConfig();
    return config ? Object.keys(config.fieldVisibility || {}) : [];
  }

  /**
   * Obtiene todas las configuraciones disponibles
   */
  getAvailableConfigs(): string[] {
    return Array.from(this.fieldConfigs.keys());
  }

  /**
   * Verifica si una configuración específica existe
   */
  hasConfig(configName: string): boolean {
    return this.fieldConfigs.has(configName);
  }

  /**
   * Obtiene una configuración específica por nombre
   */
  getConfig(configName: string): any {
    return this.fieldConfigs.get(configName);
  }

  /**
   * ✅ NUEVO: Determina si un campo debe mostrarse basado en programa seleccionado
   * Para contexto: AuthSignUpComponent
   */
  shouldShowFieldForProgram(fieldName: string, program: any): boolean {
    const config = this.getActiveConfig();
    if (!config) return true;

    const field = config.fieldVisibility[fieldName];
    if (!field) return true;

    // Si el campo tiene configuración de programas
    if (field.showForPrograms) {
      const programId = program?.id;
      if (!programId) return false;

      // Verificar si debe ocultarse para este programa
      if (field.hideForPrograms?.includes(programId)) {
        return false;
      }

      // Verificar si debe mostrarse para este programa
      return field.showForPrograms.includes(programId);
    }

    // Mantener lógica existente como fallback
    return this.shouldShowField(fieldName, program?.name || 'default');
  }

  /**
   * ✅ NUEVO: Determina si un campo debe mostrarse basado en programas de agencia
   * Para contexto: AddSchoolComponent
   */
  shouldShowFieldForAgencyPrograms(fieldName: string, programs: any[]): boolean {
    const config = this.getActiveConfig();
    if (!config) return true;

    const field = config.fieldVisibility[fieldName];
    if (!field) return true;

    // Si el campo tiene configuración de programas
    if (field.showForPrograms) {
      const programIds = programs.map(p => p.id);

      // Verificar si debe ocultarse para algún programa de la agencia
      if (field.hideForPrograms) {
        const hasHiddenProgram = programIds.some(id => field.hideForPrograms!.includes(id));
        if (hasHiddenProgram) {
          return false;
        }
      }

      // Verificar si debe mostrarse para algún programa de la agencia
      return programIds.some(id => field.showForPrograms!.includes(id));
    }

    // Mantener lógica existente como fallback
    return this.shouldShowField(fieldName, 'default');
  }

  /**
   * ✅ NUEVO: Determina si un campo es requerido basado en programa seleccionado
   */
  isFieldRequiredForProgram(fieldName: string, program: any): boolean {
    const config = this.getActiveConfig();
    if (!config) return false;

    const field = config.fieldVisibility[fieldName];
    if (!field) return false;

    // Si el campo tiene configuración de programas
    if (field.requiredForPrograms) {
      const programId = program?.id;
      return programId ? field.requiredForPrograms.includes(programId) : false;
    }

    // Mantener lógica existente como fallback
    return this.isFieldRequired(fieldName, program?.name || 'default');
  }

  /**
   * ✅ NUEVO: Determina si un campo es requerido basado en programas de agencia
   */
  isFieldRequiredForAgencyPrograms(fieldName: string, programs: any[]): boolean {
    const config = this.getActiveConfig();
    if (!config) return false;

    const field = config.fieldVisibility[fieldName];
    if (!field) return false;

    // Si el campo tiene configuración de programas
    if (field.requiredForPrograms) {
      const programIds = programs.map(p => p.id);
      return programIds.some(id => field.requiredForPrograms!.includes(id));
    }

    // Mantener lógica existente como fallback
    return this.isFieldRequired(fieldName, 'default');
  }

  /**
   * ✅ NUEVO: Obtiene todos los campos visibles para un programa seleccionado
   */
  getVisibleFieldsForProgram(program: any): string[] {
    const config = this.getActiveConfig();
    if (!config) return [];

    return Object.keys(config.fieldVisibility).filter(fieldName =>
      this.shouldShowFieldForProgram(fieldName, program)
    );
  }

}
