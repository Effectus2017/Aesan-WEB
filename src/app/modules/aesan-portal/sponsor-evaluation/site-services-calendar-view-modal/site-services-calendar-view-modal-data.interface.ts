/**
 * Datos para abrir el calendario de operación/servicios del sitio en solo lectura (portal AESAN).
 */
export interface SiteServicesCalendarViewModalData {
  siteId: number;
  /** Nombre para mostrar en el encabezado del diálogo (opcional; el calendario también puede cargarlo vía API). */
  siteName?: string;
}
