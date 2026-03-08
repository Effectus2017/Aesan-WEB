/** Payload para guardar el estado de restricción de la agencia (completado y expirado). */
export interface AgencyRestrictedStatusPayload {
  isCompleted: boolean;
  isExpired: boolean;
}
