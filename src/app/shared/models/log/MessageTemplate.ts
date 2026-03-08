export interface MessageTemplate {
  id: number;
  templateKey: string;
  titleES: string;              // Título del mensaje en español (lo que ve el usuario)
  titleEN: string;              // Título del mensaje en inglés (lo que ve el usuario)
  bodyES: string;               // Contenido del mensaje en español (lo que ve el usuario)
  bodyEN: string;               // Contenido del mensaje en inglés (lo que ve el usuario)
  icon?: string;                // Nombre del icono Material (ej: 'heroicons_outline:check-circle')
  image?: string;               // URL de la imagen a mostrar con el mensaje
  link?: string;                // Enlace asociado al mensaje (puede ser ruta Angular o URL externa)
  useRouter: boolean;            // Si es true, el Link usa router de Angular; si es false, es URL externa
  purposeES?: string;           // Propósito del template en español (solo para administración, identifica qué hace este template)
  purposeEN?: string;           // Propósito del template en inglés (solo para administración, identifica qué hace este template)
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

