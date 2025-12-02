import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[phoneFormat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneFormatDirective),
      multi: true
    }
  ]
})
export class PhoneFormatDirective implements ControlValueAccessor {
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Teclas de control permitidas
    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Escape'
    ];

    // Permitir teclas de control o combinaciones con Ctrl
    if (allowedKeys.includes(event.key) || (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))) {
      return;
    }

    // Permitir solo números, paréntesis y guiones
    const allowedChars = /^[0-9()\-]$/;
    if (!allowedChars.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Prevenir entrada del 11º dígito numérico
    if (/^[0-9]$/.test(event.key)) {
      const input = event.target as HTMLInputElement;
      const selectionStart = input.selectionStart || 0;
      const selectionEnd = input.selectionEnd || 0;
      const hasSelection = selectionStart !== selectionEnd;
      
      // Si hay texto seleccionado, permitir reemplazarlo
      if (hasSelection) {
        return;
      }
      
      const currentValue = input.value || '';
      const currentNumbers = currentValue.replace(/\D/g, '');
      
      // Si ya tiene 10 dígitos y se intenta agregar otro número, prevenir
      if (currentNumbers.length >= 10) {
        event.preventDefault();
        return;
      }
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remover todos los caracteres excepto números, paréntesis y guiones
    value = value.replace(/[^0-9()\-]/g, '');

    // Extraer solo los números para validar longitud
    const numbers = value.replace(/\D/g, '');

    // Limitar a 10 dígitos numéricos
    if (numbers.length > 10) {
      value = this.formatPhoneNumber(numbers.substring(0, 10));
    } else {
      // Formatear el número
      value = this.formatPhoneNumber(numbers);
    }

    input.value = value;

    // Enviar solo los números al formulario (sin formato)
    this.onChange(numbers);

    // Actualizar la posición del cursor
    this.setCursorPosition(input, value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedInput: string = clipboardData.getData('text');

    // Extraer solo números del texto pegado
    const numbers = pastedInput.replace(/\D/g, '').substring(0, 10);

    if (numbers.length > 0) {
      const formatted = this.formatPhoneNumber(numbers);
      this.el.nativeElement.value = formatted;
      this.onChange(numbers);
    }
  }

  private formatPhoneNumber(numbers: string): string {
    if (!numbers || numbers.length === 0) {
      return '';
    }

    // Formatear según la cantidad de dígitos
    if (numbers.length <= 3) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.substring(0, 3)}) ${numbers.substring(3)}`;
    } else {
      return `(${numbers.substring(0, 3)}) ${numbers.substring(3, 6)}-${numbers.substring(6)}`;
    }
  }

  private setCursorPosition(input: HTMLInputElement, formattedValue: string): void {
    // Mantener el cursor al final después del formateo
    setTimeout(() => {
      const length = formattedValue.length;
      input.setSelectionRange(length, length);
    }, 0);
  }

  writeValue(value: string): void {
    if (value) {
      const numbers = value.replace(/\D/g, '').substring(0, 10);
      const formatted = this.formatPhoneNumber(numbers);
      this.el.nativeElement.value = formatted;
    } else {
      this.el.nativeElement.value = '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}

