import { Directive, ElementRef, Input, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Caché global para almacenar las imágenes ya cargadas
const IMAGE_CACHE = new Map<string, string>();
const LOAD_TIMEOUT = 3000; // 3 segundos de timeout para la carga

@Directive({
    selector: '[lazyImg]',
    standalone: true
})
export class LazyImgDirective implements OnInit, OnDestroy {
    @Input() lazyImg: string;
    private placeholderSrc = 'assets/images/placeholder.png';
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

        // Si no hay URL de imagen, usar placeholder
        if (!this.lazyImg) {
            img.src = this.placeholderSrc;
            return;
        }

        // Establecer placeholder mientras carga
        if (img.src !== this.lazyImg) {
            img.src = this.placeholderSrc;
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
            rootMargin: '50px',
            threshold: 0.1
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
            img.src = this.placeholderSrc;
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
            // Mantener el placeholder en caso de error
            img.src = this.placeholderSrc;
        };

        // Iniciar la carga
        tempImage.src = this.lazyImg;
    }
}
