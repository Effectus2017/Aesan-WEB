import { Directive, HostListener, ElementRef, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, ValidationErrors, Validator } from '@angular/forms';
import { puertoRicoZipCodeValidator } from '../validators/puerto-rico-zip-code.validator';

/**
 * Directiva que valida y formatea códigos postales de Puerto Rico
 * Formato esperado: ##### o #####-####
 * - 5 dígitos básicos (requeridos)
 * - Opcionalmente 4 dígitos adicionales después de un guión
 * 
 * Formatea automáticamente agregando el guión después de 5 dígitos
 * 
 * @example
 * // Uso en template
 * <input 
 *   matInput 
 *   formControlName="zipCode" 
 *   puertoRicoZipCode 
 *   placeholder="00000 o 00000-0000" 
 * />
 */
@Directive({
  selector: '[puertoRicoZipCode][formControlName],[puertoRicoZipCode][formControl],[puertoRicoZipCode][ngModel]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PuertoRicoZipCodeDirective),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PuertoRicoZipCodeDirective),
      multi: true
    }
  ]
})
export class PuertoRicoZipCodeDirective implements ControlValueAccessor, Validator, OnInit {
  private onChange = (value: string) => {};
  private onTouched = () => {};
  private validator = puertoRicoZipCodeValidator();

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    // Establecer placeholder si no tiene uno o si es el placeholder por defecto
    const currentPlaceholder = this.el.nativeElement.placeholder;
    if (!currentPlaceholder || currentPlaceholder.toLowerCase().includes('ingresa') || currentPlaceholder.toLowerCase().includes('enter')) {
      this.el.nativeElement.placeholder = '00000 o 00000-0000';
    }
  }

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

    // Permitir solo números y guiones
    const allowedChars = /^[0-9\-]$/;
    if (!allowedChars.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Obtener el valor actual sin formato
    const input = this.el.nativeElement;
    const currentValue = input.value || '';
    const numbers = currentValue.replace(/\D/g, '');
    
    // Limitar a 9 dígitos (5 + 4 opcionales)
    if (numbers.length >= 9 && event.key !== '-') {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remover todos los caracteres excepto números y guiones
    value = value.replace(/[^0-9\-]/g, '');

    // Extraer solo los números para validar longitud
    const numbers = value.replace(/\D/g, '');

    // Limitar a 9 dígitos (5 + 4 opcionales)
    if (numbers.length > 9) {
      value = this.formatZipCode(numbers.substring(0, 9));
    } else {
      // Formatear el código postal
      value = this.formatZipCode(numbers);
    }

    input.value = value;

    // Enviar el valor formateado al formulario
    this.onChange(value);

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
    const numbers = pastedInput.replace(/\D/g, '').substring(0, 9);

    if (numbers.length > 0) {
      const formatted = this.formatZipCode(numbers);
      this.el.nativeElement.value = formatted;
      this.onChange(formatted);
    }
  }

  private formatZipCode(numbers: string): string {
    if (!numbers || numbers.length === 0) {
      return '';
    }

    // Si tiene 5 dígitos o menos, solo mostrar los números
    if (numbers.length <= 5) {
      return numbers;
    } else {
      // Si tiene más de 5 dígitos, agregar el guión después del quinto dígito
      return `${numbers.substring(0, 5)}-${numbers.substring(5)}`;
    }
  }

  private setCursorPosition(input: HTMLInputElement, formattedValue: string): void {
    // Mantener el cursor al final después del formateo
    setTimeout(() => {
      const length = formattedValue.length;
      input.setSelectionRange(length, length);
    }, 0);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (value) {
      const numbers = value.replace(/\D/g, '').substring(0, 9);
      const formatted = this.formatZipCode(numbers);
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

  // Validator implementation
  validate(control: AbstractControl): ValidationErrors | null {
    return this.validator(control);
  }
}
