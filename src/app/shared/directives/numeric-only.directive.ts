import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[numericOnly]', // Se utilizará como atributo en los inputs
  standalone: true,
})
export class NumericOnlyDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Teclas de control permitidas
    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Escape'
    ];

    // Permitir teclas de control o combinaciones con Ctrl (e.g. Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X)
    if (allowedKeys.includes(event.key) || (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))) {
      return;
    }

    // Si la tecla pulsada no es un dígito, se previene el input
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData || window['clipboardData'];
    const pastedInput: string = clipboardData.getData('text');
    // Prevenir pegar si no es un texto numérico
    if (!/^\d+$/.test(pastedInput)) {
      event.preventDefault();
    }
  }
}
