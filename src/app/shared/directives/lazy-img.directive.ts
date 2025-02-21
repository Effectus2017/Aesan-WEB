import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[lazyImg]',
    standalone: true
})
export class LazyImgDirective implements OnInit {
    @Input() lazyImg: string;

    constructor(private el: ElementRef<HTMLImageElement>) {}

    ngOnInit() {
        const img = this.el.nativeElement;

        // Configurar loading lazy
        img.loading = 'lazy';

        // Placeholder mientras carga
        img.src = 'assets/images/placeholder.png';

        // Observer para cargar cuando sea visible
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    img.src = this.lazyImg;
                    observer.unobserve(img);
                }
            });
        });

        observer.observe(img);
    }
}
