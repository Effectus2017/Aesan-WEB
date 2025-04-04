import { Pipe, PipeTransform } from '@angular/core';
import { normalizeImageUrl } from '../utils';

/**
 * Pipe para normalizar y limpiar URLs de imágenes para evitar problemas con barras invertidas
 * Ejemplo de uso: [src]="imageUrl | safeImageUrl"
 */
@Pipe({
  name: 'safeImageUrl',
  standalone: true,
})
export class SafeImageUrlPipe implements PipeTransform {
  /**
   * Normaliza una URL de imagen
   * @param url URL de la imagen a normalizar
   * @returns URL normalizada
   */
  transform(url: string | null | undefined): string | null | undefined {
    if (!url) {
      return url;
    }

    return normalizeImageUrl(url);
  }
}
