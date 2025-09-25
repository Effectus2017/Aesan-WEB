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
    this.updateGridColumns();
  }

  ngAfterContentChecked(): void {
    this.updateGridColumns();
  }

  private updateGridColumns(): void {
    // Contar elementos directos visibles (no anidados)
    const children = Array.from(this.el.nativeElement.children) as Element[];
    const directChildren = children.filter(child => {
      const computedStyle = window.getComputedStyle(child);
      return computedStyle.display !== 'none' &&
             computedStyle.visibility !== 'hidden' &&
             (!child.hasAttribute('ng-reflect-ng-if') ||
              child.getAttribute('ng-reflect-ng-if') !== 'false');
    });

    const visibleCount = directChildren.length;

    // Remover clases existentes del breakpoint
    const regex = new RegExp(`${this.breakpoint}:grid-cols-\\d+`, 'g');
    this.el.nativeElement.className = this.el.nativeElement.className.replace(regex, '');

    // Agregar nueva clase dinámica
    this.el.nativeElement.classList.add(`${this.breakpoint}:grid-cols-${visibleCount}`);
  }
}
