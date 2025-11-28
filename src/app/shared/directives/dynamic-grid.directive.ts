import { Directive, ElementRef, Input, AfterViewInit, AfterContentChecked } from '@angular/core';

@Directive({
  selector: '[appDynamicGrid]',
  standalone: true
})
export class DynamicGridDirective implements AfterViewInit, AfterContentChecked {
  @Input() appDynamicGrid: number = 3; // Cantidad inicial de campos esperados
  @Input() breakpoint: string = 'sm'; // Breakpoint por defecto (sm, md, lg, xl)

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    // Usar setTimeout para asegurar que los elementos con *ngIf estén renderizados
    setTimeout(() => {
      this.updateGridColumns();
    }, 0);
  }

  ngAfterContentChecked(): void {
    this.updateGridColumns();
  }

  private updateGridColumns(): void {
    // Contar elementos directos visibles (no anidados)
    const children = Array.from(this.el.nativeElement.children) as Element[];
    const directChildren = children.filter(child => {
      const computedStyle = window.getComputedStyle(child);
      const isVisible = computedStyle.display !== 'none' &&
                        computedStyle.visibility !== 'hidden';
      
      // Verificar *ngIf - puede estar en ng-reflect-ng-if o en el elemento mismo
      const ngIfValue = child.getAttribute('ng-reflect-ng-if');
      const hasNgIfFalse = ngIfValue === 'false';
      
      return isVisible && !hasNgIfFalse;
    });

    const visibleCount = directChildren.length;

    // Solo actualizar si hay elementos visibles
    if (visibleCount > 0) {
      // Remover clases existentes del breakpoint
      const regex = new RegExp(`${this.breakpoint}:grid-cols-\\d+`, 'g');
      this.el.nativeElement.className = this.el.nativeElement.className.replace(regex, '');

      // Agregar nueva clase dinámica
      this.el.nativeElement.classList.add(`${this.breakpoint}:grid-cols-${visibleCount}`);
    }
  }
}
