import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Códigos de área válidos de Puerto Rico
 */
const VALID_AREA_CODES = ['787', '939', '849'];

/**
 * Directiva que valida y formatea códigos de área de Puerto Rico
 * Limita la entrada a 3 dígitos y solo permite números
 * 
 * @example
 * <!-- Como directiva en template -->
 * <input puertoRicoAreaCode formControlName="areaCode" />
 */
@Directive({
  selector: '[puertoRicoAreaCode]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PuertoRicoAreaCodeDirective),
      multi: true
    }
  ]
})
export class PuertoRicoAreaCodeDirective implements ControlValueAccessor {
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

    // Permitir solo números
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Verificar que no exceda 3 dígitos
    const input = this.el.nativeElement;
    const currentValue = input.value || '';
    const numbers = currentValue.replace(/\D/g, '');
    
    if (numbers.length >= 3) {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remover todos los caracteres no numéricos
    value = value.replace(/\D/g, '');

    // Limitar a 3 dígitos (código de área)
    if (value.length > 3) {
      value = value.substring(0, 3);
    }

    input.value = value;
    this.onChange(value);
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

    // Extraer solo números y limitar a 3 dígitos
    const numbers = pastedInput.replace(/\D/g, '').substring(0, 3);

    if (numbers.length > 0) {
      this.el.nativeElement.value = numbers;
      this.onChange(numbers);
    }
  }

  writeValue(value: string): void {
    if (value) {
      const numbers = value.replace(/\D/g, '').substring(0, 3);
      this.el.nativeElement.value = numbers;
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

