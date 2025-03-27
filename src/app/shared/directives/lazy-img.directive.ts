import { Directive, ElementRef, Input, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Caché global para almacenar las imágenes ya cargadas
const IMAGE_CACHE = new Map<string, string>();
const LOAD_TIMEOUT = 1500; // 1.5 segundos de timeout para la carga

@Directive({
    selector: '[lazyImg]',
    standalone: true
})
export class LazyImgDirective implements OnInit, OnDestroy {
    @Input() lazyImg: string;
    private observer: IntersectionObserver;
    private loadTimeout: number;

    constructor(
        private el: ElementRef<HTMLImageElement>,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit() {
        // Solo ejecutar en el navegador
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const img = this.el.nativeElement;

        // Configurar loading lazy nativo del navegador
        img.loading = 'lazy';
        img.decoding = 'async'; // Usar decodificación asíncrona

        // Si no hay URL de imagen, no hacer nada
        if (!this.lazyImg) {
            return;
        }

        // Verificar si la imagen ya está en caché
        if (IMAGE_CACHE.has(this.lazyImg)) {
            // Usar la versión en caché inmediatamente
            img.src = IMAGE_CACHE.get(this.lazyImg);
            return;
        }

        // Observer para cargar cuando sea visible
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Cargar la imagen
                    this.loadImage(img);
                    this.observer?.unobserve(img);
                }
            });
        }, {
            // Configuración para cargar la imagen un poco antes de que sea visible
            rootMargin: '100px', // Aumentar el margen para precargar antes
            threshold: 0.01 // Reducir el umbral para cargar más temprano
        });

        this.observer.observe(img);
    }

    ngOnDestroy() {
        // Limpiar el observer cuando el componente se destruye
        if (this.observer) {
            this.observer.disconnect();
        }
        // Limpiar el timeout si existe
        if (this.loadTimeout) {
            window.clearTimeout(this.loadTimeout);
        }
    }

    private loadImage(img: HTMLImageElement): void {
        // Si la imagen ya está cargada con la URL correcta, no hacer nada
        if (img.src === this.lazyImg) {
            return;
        }

        // Crear una nueva imagen para precargar
        const tempImage = new Image();

        // Configurar timeout para la carga
        this.loadTimeout = window.setTimeout(() => {
            tempImage.src = ''; // Cancelar la carga
            console.warn(`Timeout loading image: ${this.lazyImg}`);
        }, LOAD_TIMEOUT);

        // Cuando la imagen termine de cargar
        tempImage.onload = () => {
            // Limpiar el timeout
            if (this.loadTimeout) {
                window.clearTimeout(this.loadTimeout);
            }
            // Guardar en caché
            IMAGE_CACHE.set(this.lazyImg, this.lazyImg);
            // Asignar la imagen cargada al elemento
            img.src = this.lazyImg;
        };

        // Si hay error al cargar
        tempImage.onerror = () => {
            // Limpiar el timeout
            if (this.loadTimeout) {
                window.clearTimeout(this.loadTimeout);
            }
            console.error(`Error loading image: ${this.lazyImg}`);
        };

        // Iniciar la carga
        tempImage.src = this.lazyImg;
    }
}
