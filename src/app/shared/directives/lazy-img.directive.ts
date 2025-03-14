import { Directive, ElementRef, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Caché global para almacenar las imágenes ya cargadas
const IMAGE_CACHE = new Map<string, string>();

@Directive({
    selector: '[lazyImg]',
    standalone: true
})
export class LazyImgDirective implements OnInit {
    @Input() lazyImg: string;
    private placeholderSrc = 'assets/images/placeholder.png';

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

        // Establecer placeholder mientras carga
        img.src = this.placeholderSrc;

        // Verificar si la imagen ya está en caché
        if (IMAGE_CACHE.has(this.lazyImg)) {
            // Usar la versión en caché inmediatamente
            img.src = IMAGE_CACHE.get(this.lazyImg);
            return;
        }

        // Observer para cargar cuando sea visible
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Cargar la imagen
                    this.loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            // Configuración para cargar la imagen un poco antes de que sea visible
            rootMargin: '50px'
        });

        observer.observe(img);
    }

    private loadImage(img: HTMLImageElement): void {
        // Crear una nueva imagen para precargar
        const tempImage = new Image();

        // Cuando la imagen termine de cargar
        tempImage.onload = () => {
            // Guardar en caché
            IMAGE_CACHE.set(this.lazyImg, this.lazyImg);
            // Asignar la imagen cargada al elemento
            img.src = this.lazyImg;
        };

        // Si hay error al cargar
        tempImage.onerror = () => {
            console.error(`Error loading image: ${this.lazyImg}`);
            // Mantener el placeholder en caso de error
            img.src = this.placeholderSrc;
        };

        // Iniciar la carga
        tempImage.src = this.lazyImg;
    }
}
