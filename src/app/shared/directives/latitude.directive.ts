import { Directive, HostListener, ElementRef, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, AbstractControl, ValidationErrors, Validator } from '@angular/forms';
import { latitudeValidator } from '../validators/latitude.validator';

/**
 * Directiva que valida y formatea coordenadas de latitud
 * Rango válido: -90 a 90 grados
 * Permite números decimales con punto como separador
 * 
 * @example
 * // Uso en template
 * <input 
 *   matInput 
 *   formControlName="latitude" 
 *   latitude 
 *   placeholder="-90 a 90" 
 * />
 */
@Directive({
  selector: '[latitude][formControlName],[latitude][formControl],[latitude][ngModel]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LatitudeDirective),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LatitudeDirective),
      multi: true
    }
  ]
})
export class LatitudeDirective implements ControlValueAccessor, Validator, OnInit {
  private onChange = (value: string) => {};
  private onTouched = () => {};
  private validator = latitudeValidator();

  constructor(private el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    // Establecer placeholder si no tiene uno
    const currentPlaceholder = this.el.nativeElement.placeholder;
    if (!currentPlaceholder || currentPlaceholder.toLowerCase().includes('ingresa') || currentPlaceholder.toLowerCase().includes('enter')) {
      this.el.nativeElement.placeholder = '-90 a 90';
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Teclas de control permitidas
    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'Escape'
    ];

    // Permitir teclas de control o combinaciones con Ctrl/Cmd (Mac)
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShortcut = isCtrlOrCmd && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase());
    
    if (allowedKeys.includes(event.key) || isShortcut) {
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
    event.stopPropagation();
    
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    if (!clipboardData) {
      return;
    }
    
    const pastedInput: string = clipboardData.getData('text');
    if (!pastedInput) {
      return;
    }

    const input = this.el.nativeElement;
    const currentValue = input.value || '';
    const cursorPosition = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    
    // Obtener el texto antes y después de la selección
    const textBefore = currentValue.substring(0, cursorPosition);
    const textAfter = currentValue.substring(selectionEnd);

    // Limpiar el texto pegado
    let cleanedValue = pastedInput.replace(/[^0-9.\-]/g, '');

    // Asegurar formato correcto
    const hasNegative = cleanedValue.includes('-');
    cleanedValue = cleanedValue.replace(/-/g, '');
    if (hasNegative && !textBefore.includes('-')) {
      cleanedValue = '-' + cleanedValue;
    }

    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      cleanedValue = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parts.length === 2 && parts[1].length > 6) {
      cleanedValue = parts[0] + '.' + parts[1].substring(0, 6);
    }

    // Construir el nuevo valor
    let newValue = textBefore + cleanedValue + textAfter;
    
    // Asegurar que solo haya un signo negativo al inicio
    if (newValue.includes('-')) {
      const negativeCount = (newValue.match(/-/g) || []).length;
      if (negativeCount > 1) {
        newValue = '-' + newValue.replace(/-/g, '');
      } else if (!newValue.startsWith('-')) {
        newValue = '-' + newValue.replace(/-/g, '');
      }
    }
    
    // Asegurar que solo haya un punto decimal
    const decimalParts = newValue.split('.');
    if (decimalParts.length > 2) {
      newValue = decimalParts[0] + '.' + decimalParts.slice(1).join('');
    }
    
    // Limitar la precisión decimal a 6 dígitos después del punto
    if (decimalParts.length === 2 && decimalParts[1].length > 6) {
      newValue = decimalParts[0] + '.' + decimalParts[1].substring(0, 6);
    }

    // Actualizar el valor del input
    input.value = newValue;
    
    // Notificar el cambio al formulario reactivo primero
    this.onChange(newValue);
    
    // Actualizar la posición del cursor
    const newCursorPosition = cursorPosition + cleanedValue.length;
    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPosition, newCursorPosition);
      // Disparar evento input para asegurar que Angular detecte el cambio
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
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

