import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private readonly WEBP_SUPPORT = this.checkWebPSupport();

    /**
     * Optimiza una URL de imagen
     */
    optimizeImageUrl(url: string, width?: number): string {
        if (!url) return '';

        // Si es una URL externa, usar un servicio de optimización
        if (url.startsWith('http')) {
            return this.optimizeExternalUrl(url, width);
        }

        // Si es local, usar versión WebP si está soportada
        if (this.WEBP_SUPPORT && !url.endsWith('.webp')) {
            url = url.replace(/\.(jpg|jpeg|png)$/, '.webp');
        }

        return url;
    }

    /**
     * Optimiza URLs externas usando un CDN de imágenes
     */
    private optimizeExternalUrl(url: string, width?: number): string {
        // Ejemplo usando ImageKit.io - reemplazar con tu dominio
        const encodedUrl = encodeURIComponent(url);
        let optimizedUrl = `https://ik.imagekit.io/tudominio/tr:f-auto`;

        if (width) {
            optimizedUrl += `,w-${width}`;
        }

        return `${optimizedUrl}/${encodedUrl}`;
    }

    /**
     * Verifica soporte de WebP en el navegador
     */
    private checkWebPSupport(): boolean {
        const canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    }
}
