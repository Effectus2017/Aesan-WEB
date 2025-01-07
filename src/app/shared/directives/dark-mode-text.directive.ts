import { Directive, ElementRef, inject, OnInit } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config';

@Directive({
  selector: '[darkModeText]',
  standalone: true,
})
export class DarkModeTextDirective implements OnInit {
  private _elementRef: ElementRef = inject(ElementRef);
  private _fuseConfigService = inject(FuseConfigService);

  ngOnInit(): void {
    // Suscribirse a los cambios del tema
    this._fuseConfigService.config$.subscribe((config) => {
      const isDarkMode = config.scheme === 'dark';

      // Remover clases existentes
      this._elementRef.nativeElement.classList.remove('text-slate-300', 'text-slate-700');

      // Agregar la clase correspondiente
      if (isDarkMode) {
        this._elementRef.nativeElement.classList.add('text-slate-300');
      } else {
        this._elementRef.nativeElement.classList.add('text-slate-700');
      }
    });
  }
}
