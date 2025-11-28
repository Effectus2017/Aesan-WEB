export interface TemplateVariable {
  key: string;              // Nombre de la variable (sin llaves) - Ejemplo: "SiteName"
  displayName: string;      // Formato de visualización (con llaves) - Ejemplo: "{SiteName}"
  descriptionES: string;    // Descripción de la variable en español
  descriptionEN: string;    // Descripción de la variable en inglés
  category: string;         // Categoría a la que pertenece - Ejemplo: "Sitio", "Auspiciador", "Agencia", "Fecha", "Justificación"
  exampleES: string;        // Ejemplo de uso en español
  exampleEN: string;        // Ejemplo de uso en inglés
  dataType: string;         // Tipo de dato - Ejemplo: "string", "date", "number"
}

