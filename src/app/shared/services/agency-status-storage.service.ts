import { inject, Injectable } from '@angular/core';
import { AgencyRestrictedStatusPayload } from 'app/shared/models/AgencyRestrictedStatusPayload';

/**
 * Interfaz para el estado de restricción de la agencia (incluye timestamp interno).
 */
export interface AgencyRestrictedStatus extends AgencyRestrictedStatusPayload {
  lastUpdated: string;
}

/**
 * Servicio para almacenar y recuperar el estado de restricción de la agencia
 * en localStorage de forma hasheada por seguridad
 */
@Injectable({
  providedIn: 'root',
})
export class AgencyStatusStorageService {
  private readonly STORAGE_KEY = 'agencyRestrictedStatus';
  // En producción, considerar usar variable de entorno
  private readonly SECRET_KEY = 'AESAN_AGENCY_STATUS_SECRET_KEY_2025';

  // Cache en memoria para evitar deshashear repetidamente
  private _cachedStatus: AgencyRestrictedStatus | null = null;
  private _cachedHashedValue: string | null = null;

  /**
   * Guarda el estado de restricción de la agencia en localStorage de forma hasheada
   * @param data Datos del estado (completado y expirado)
   */
  setAgencyRestrictedStatus(data: AgencyRestrictedStatusPayload): void {
    const dataWithTimestamp: AgencyRestrictedStatus = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    const jsonData = JSON.stringify(dataWithTimestamp);
    const hashed = this._hash(jsonData);
    localStorage.setItem(this.STORAGE_KEY, hashed);

    // Actualizar cache
    this._cachedStatus = dataWithTimestamp;
    this._cachedHashedValue = hashed;
  }

  /**
   * Obtiene el estado de restricción de la agencia desde localStorage
   * Usa cache en memoria para evitar deshashear repetidamente
   * @returns Estado de la agencia o null si no existe o hay error
   */
  getAgencyRestrictedStatus(): AgencyRestrictedStatus | null {
    const hashed = localStorage.getItem(this.STORAGE_KEY);

    if (!hashed) {
      // Limpiar cache si no hay datos
      this._cachedStatus = null;
      this._cachedHashedValue = null;
      return null;
    }

    // Si el valor hasheado no cambió, devolver el cache
    if (this._cachedHashedValue === hashed && this._cachedStatus !== null) {
      return this._cachedStatus;
    }

    // Si cambió o no hay cache, deshashear y actualizar cache
    try {
      const unhashed = this._unhash(hashed);
      const data: AgencyRestrictedStatus = JSON.parse(unhashed);

      // Actualizar cache
      this._cachedStatus = data;
      this._cachedHashedValue = hashed;

      return data;
    } catch (error) {
      console.error('[AgencyStatusStorageService] Error al deshashear datos:', error);
      // Limpiar cache en caso de error
      this._cachedStatus = null;
      this._cachedHashedValue = null;
      return null;
    }
  }

  /**
   * Limpia el estado de restricción de la agencia del localStorage
   */
  clearAgencyRestrictedStatus(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    // Limpiar cache
    this._cachedStatus = null;
    this._cachedHashedValue = null;
  }

  /**
   * Verifica si la agencia está restringida (completada o expirada)
   * @returns true si está restringida, false en caso contrario
   */
  isAgencyRestricted(): boolean {
    const status = this.getAgencyRestrictedStatus();
    if (!status) {
      return false;
    }
    return status.isCompleted || status.isExpired;
  }

  /**
   * Hashea los datos usando Base64 con clave secreta
   * @param data Datos a hashear
   * @returns String hasheado
   * @private
   */
  private _hash(data: string): string {
    try {
      // Combinar datos con clave secreta
      const combined = `${this.SECRET_KEY}${data}${this.SECRET_KEY}`;
      // Codificar a Base64
      const encoded = btoa(unescape(encodeURIComponent(combined)));
      return encoded;
    } catch (error) {
      console.error('[AgencyStatusStorageService] Error al hashear datos:', error);
      throw error;
    }
  }

  /**
   * Deshashea los datos
   * @param hashed Datos hasheados
   * @returns String original
   * @private
   */
  private _unhash(hashed: string): string {
    try {
      // Decodificar desde Base64
      const decoded = decodeURIComponent(escape(atob(hashed)));
      // Remover clave secreta del inicio y final
      if (decoded.startsWith(this.SECRET_KEY) && decoded.endsWith(this.SECRET_KEY)) {
        return decoded.slice(
          this.SECRET_KEY.length,
          decoded.length - this.SECRET_KEY.length
        );
      }
      throw new Error('Datos hasheados inválidos');
    } catch (error) {
      console.error('[AgencyStatusStorageService] Error al deshashear datos:', error);
      throw error;
    }
  }
}

