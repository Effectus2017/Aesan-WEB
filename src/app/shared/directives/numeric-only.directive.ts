import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[numericOnly]', // Se utilizará como atributo en los inputs
  standalone: true,
})
export class NumericOnlyDirective {
  @Input() maxLength?: number;

  constructor(private el: ElementRef<HTMLInputElement>) {}

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
      return;
    }

    // Verificar maxlength si está definido
    const input = this.el.nativeElement;
    const maxLength = this.maxLength || input.getAttribute('maxlength');

    if (maxLength) {
      const currentValue = input.value || '';
      // Si ya alcanzó el máximo, prevenir entrada de nuevos dígitos
      if (currentValue.length >= parseInt(maxLength.toString(), 10)) {
        event.preventDefault();
      }
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;
    const maxLength = this.maxLength || input.getAttribute('maxlength');

    if (maxLength) {
      const maxLen = parseInt(maxLength.toString(), 10);
      if (input.value && input.value.length > maxLen) {
        input.value = input.value.substring(0, maxLen);
        input.dispatchEvent(new Event('input'));
      }
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData || window['clipboardData'];
    const pastedInput: string = clipboardData.getData('text');

    // Prevenir pegar si no es un texto numérico
    if (!/^\d+$/.test(pastedInput)) {
      event.preventDefault();
      return;
    }

    // Verificar maxlength si está definido
    const input = this.el.nativeElement;
    const maxLength = this.maxLength || input.getAttribute('maxlength');

    if (maxLength) {
      const maxLen = parseInt(maxLength.toString(), 10);
      const currentValue = input.value || '';
      const newValue = currentValue + pastedInput;

      if (newValue.length > maxLen) {
        event.preventDefault();
        // Pegar solo hasta el máximo permitido
        input.value = newValue.substring(0, maxLen);
        input.dispatchEvent(new Event('input'));
      }
    }
  }
}
