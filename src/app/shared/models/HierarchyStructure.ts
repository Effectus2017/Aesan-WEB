/**
 * Modelos TypeScript para la estructura jerárquica del árbol de jerarquía de escuelas
 */

/**
 * Respuesta que contiene la estructura jerárquica completa para el árbol de jerarquía de escuelas
 */
export interface HierarchyStructureResponse {
  sponsor: SponsorNode;
  year: YearNode;
  schools: SchoolNode[];
}

/**
 * Nodo que representa un Auspiciador Administrador (Nivel 1)
 */
export interface SponsorNode {
  id: number;
  name: string;
  code: string;
}

/**
 * Nodo que representa un Año (Nivel 2)
 */
export interface YearNode {
  year: number;
}

/**
 * Nodo que representa una Escuela (Nivel 3)
 */
export interface SchoolNode {
  id: number;
  name: string;
  schoolCode: string;
  schoolNumber?: number | null;
  sites: SiteNode[];
}

/**
 * Nodo que representa un Sitio (Nivel 4)
 */
export interface SiteNode {
  id: number;
  name: string;
  siteNumber?: number | null;
  siteCode: string;
  isActive?: boolean | null;
}

