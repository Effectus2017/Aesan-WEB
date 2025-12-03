import { Directive, HostListener, ElementRef, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, ValidationErrors, Validator } from '@angular/forms';
import { longitudeValidator } from '../validators/longitude.validator';

/**
 * Directiva que valida y formatea coordenadas de longitud
 * Rango válido: -180 a 180 grados
 * Permite números decimales con punto como separador
 * 
 * @example
 * // Uso en template
 * <input 
 *   matInput 
 *   formControlName="longitude" 
 *   longitude 
 *   placeholder="-180 a 180" 
 * />
 */
@Directive({
  selector: '[longitude][formControlName],[longitude][formControl],[longitude][ngModel]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LongitudeDirective),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LongitudeDirective),
      multi: true
    }
  ]
})
export class LongitudeDirective implements ControlValueAccessor, Validator, OnInit {
  private onChange = (value: string) => {};
  private onTouched = () => {};
  private validator = longitudeValidator();

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    // Establecer placeholder si no tiene uno
    const currentPlaceholder = this.el.nativeElement.placeholder;
    if (!currentPlaceholder || currentPlaceholder.toLowerCase().includes('ingresa') || currentPlaceholder.toLowerCase().includes('enter')) {
      this.el.nativeElement.placeholder = '-180 a 180';
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

    // Permitir números, punto decimal y signo negativo
    const allowedChars = /^[0-9.\-]$/;
    if (!allowedChars.test(event.key)) {
      event.preventDefault();
      return;
    }

    const input = this.el.nativeElement;
    const currentValue = input.value || '';
    const cursorPosition = input.selectionStart || 0;

    // Si se intenta agregar un signo negativo, solo permitirlo al inicio
    if (event.key === '-') {
      if (cursorPosition !== 0 || currentValue.includes('-')) {
        event.preventDefault();
      }
      return;
    }

    // Si se intenta agregar un punto, verificar que no haya uno ya
    if (event.key === '.') {
      if (currentValue.includes('.')) {
        event.preventDefault();
      }
      return;
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remover caracteres no permitidos (solo números, punto y signo negativo)
    value = value.replace(/[^0-9.\-]/g, '');

    // Asegurar que el signo negativo esté solo al inicio
    const hasNegative = value.includes('-');
    value = value.replace(/-/g, '');
    if (hasNegative && !value.startsWith('-')) {
      value = '-' + value;
    }

    // Limitar a un solo punto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limitar la precisión decimal a 6 dígitos después del punto
    if (parts.length === 2 && parts[1].length > 6) {
      value = parts[0] + '.' + parts[1].substring(0, 6);
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

    // Limpiar el texto pegado
    let value = pastedInput.replace(/[^0-9.\-]/g, '');

    // Asegurar formato correcto
    const hasNegative = value.includes('-');
    value = value.replace(/-/g, '');
    if (hasNegative) {
      value = '-' + value;
    }

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parts.length === 2 && parts[1].length > 6) {
      value = parts[0] + '.' + parts[1].substring(0, 6);
    }

    this.el.nativeElement.value = value;
    this.onChange(value);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (value !== null && value !== undefined) {
      this.el.nativeElement.value = value.toString();
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

