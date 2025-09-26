import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonConfig, GenericTableConfig, OnGenericTableHandler } from './generic-table.interface';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'app-generic-table',
    templateUrl: './generic-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatCheckboxModule, MatTooltipModule, TranslocoModule]
})
export class GenericTableComponent implements OnInit {
  @Input() config: GenericTableConfig;
  @Input() handler: OnGenericTableHandler;
  @Input() darkMode: boolean = false;

  private _authService = inject(AuthService);
  private _translocoService = inject(TranslocoService);

  ngOnInit(): void {

  }

  /**
   * Verifica si un botón debe estar deshabilitado basado en permisos
   * @param button Configuración del botón
   * @returns true si el botón debe estar deshabilitado
   */
  isButtonDisabled(button: ButtonConfig): boolean {
    // Si está explícitamente deshabilitado, retornar true
    if (button.disabled) {
      return true;
    }

    // Si tiene permiso definido, verificar si el usuario lo tiene
    if (button.permission) {
      return !this._authService.hasPermission(button.permission);
    }

    // Si no tiene permiso definido, el botón está habilitado
    return false;
  }

  /**
   * Obtiene el tooltip para un botón
   * @param button Configuración del botón
   * @returns El mensaje del tooltip apropiado
   */
  getButtonTooltip(button: ButtonConfig): string | undefined {
    // Si está deshabilitado, mostrar tooltip de deshabilitado
    if (this.isButtonDisabled(button)) {
      // Si tiene tooltip personalizado para deshabilitado, usarlo
      if (button.disabledTooltip) {
        return this._translocoService.translate(button.disabledTooltip);
      }

      // Si está deshabilitado por permisos, mostrar mensaje genérico
      if (button.permission && !this._authService.hasPermission(button.permission)) {
        return this._translocoService.translate('global.tooltips.noPermission');
      }

      return undefined;
    }

    // Si está habilitado, mostrar tooltip normal si existe
    if (button.tooltip) {
      return this._translocoService.translate(button.tooltip);
    }

    return undefined;
  }

  // Functions
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  /**
   * Convierte un tamaño en bytes a MB con el número especificado de decimales
   * @param bytes Tamaño en bytes
   * @param decimals Número de decimales a mostrar
   * @param unit Unidad a mostrar (por defecto MB)
   * @returns Tamaño en MB como string con la unidad
   */
  formatFileSize(bytes: number, decimals: number = 2, unit: string = 'MB'): string {
    if (!bytes) return `0 ${unit}`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(decimals)} ${unit}`;
  }

  /**
   * Método para manejar el clic en el botón de adición.
   * Llama a la función onAddButtonClick del handler proporcionado.
   * @param event El evento de clic.
   */
  onAddButtonClick(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.config.onAddButtonClick) {
      this.config.onAddButtonClick(event);
    } else if (this.handler?.onAddButtonClick) {
      this.handler.onAddButtonClick(event);
    }
  }

  onButtonClick(event: Event, button: ButtonConfig, element: any): void {
    event.preventDefault();
    event.stopPropagation();

    if (button.action) {
      button.action(event, element);
      return;
    }

    switch (button.key) {
      case 'add':
        if (this.handler?.onTableAdd) {
          this.handler.onTableAdd(event, element);
        }
        break;
      case 'edit':
        if (this.handler?.onTableEdit) {
          this.handler.onTableEdit(event, element.id);
        }
        break;
      case 'delete':
        if (this.handler?.onTableDelete) {
          this.handler.onTableDelete(event, element.id);
        }
        break;
      case 'calendar':
        if (this.handler?.onTableCalendar) {
          this.handler.onTableCalendar(event, element.id);
        }
        break;
    }
  }

  /**
   * Método para manejar la edición de un elemento de la tabla.
   * Llama a la función onTableEdit del handler proporcionado.
   * @param event El evento de edición.
   * @param id El ID del elemento a editar.
   */
  onEdit(event: Event, id: number): void {
    this.handler.onTableEdit(event, id);
  }

  onEditElement(event: Event, element: any): void {
    this.handler.onTableEditElement(event, element);
  }

  /**
   * Método para manejar la eliminación de un elemento de la tabla.
   * Llama a la función onTableDelete del handler proporcionado.
   * @param event El evento de eliminación.
   * @param id El ID del elemento a eliminar.
   */
  onDelete(event: Event, id: number): void {
    this.handler.onTableDelete(event, id);
  }

  /**
   * Método para manejar la descarga de un elemento de la tabla.
   * Llama a la función onTableDownload del handler proporcionado.
   * @param event El evento de descarga.
   * @param id El ID del elemento a descargar.
   */
  onDownload(event: Event, id: number): void {
    this.handler.onTableDownload(event, id);
  }

  /**
   * Método para manejar el calendario de un elemento de la tabla.
   * Llama a la función onTableCalendar del handler proporcionado.
   * @param event El evento de calendario.
   * @param id El ID del elemento para el calendario.
   */
  onCalendar(event: Event, id: number): void {
    this.handler.onTableCalendar(event, id);
  }

  /**
   * Método para manejar el cambio de estado de un checkbox en la tabla.
   * Llama a la función onTableCheckChange del handler proporcionado.
   * @param event El evento de cambio del checkbox.
   * @param element El elemento de la fila que contiene el checkbox.
   * @param key La clave o claves del valor a cambiar en el elemento.
   */
  onCheckboxChange(event: MatCheckboxChange, element: any, key: string | string[]): void {
    if (this.handler && this.handler.onTableCheckChange) {
      this.handler.onTableCheckChange(event, element);
    }
  }

  /**
   * Esta función se encarga de manejar el cambio de estado de un checkbox en la tabla.
   *
   * @param event El evento de cambio del checkbox.
   * @param element El elemento de la fila que contiene el checkbox.
   * @param key La clave del valor a cambiar en el elemento.
   */
  getNestedValue(element: any, path: string | string[]): any {
    // Handle null/undefined path
    if (!path) {
      return undefined;
    }

    if (Array.isArray(path)) {
      return path.map(p => this.getNestedValue(element, p)).join(' ');
    }

    // Ensure path is a string before calling split
    if (typeof path !== 'string') {
      return undefined;
    }

    return path.split('.').reduce((obj, key) =>
      (obj && obj[key] !== undefined) ? obj[key] : undefined, element);
  }

  /**
   * Esta función se encarga de obtener el valor de una propiedad anidada en un objeto.
   * Si el path es un arreglo, se concatenan los valores de las propiedades anidadas
   * separados por un espacio.
   *
   * @param element El objeto que contiene las propiedades anidadas.
   * @param path El camino a la propiedad anidada. Puede ser una cadena o un arreglo de cadenas.
   * @returns El valor de la propiedad anidada o undefined si no se encuentra.
   */
  getColumnDef(col: any): string {
    if (!col || !col.key) {
      return '';
    }
    return Array.isArray(col.key) ? col.key[0] : col.key;
  }

  /**
   * Maneja el error cuando una imagen no se puede cargar
   * @param event El evento de error
   * @param defaultImage La imagen por defecto a mostrar
   */
  handleMissingImage(event: Event, defaultImage: string): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = defaultImage || 'assets/images/avatars/profile.png';
  }

  /**
   * Obtiene el icono correspondiente al tipo de archivo
   * @param element El elemento que contiene el tipo de archivo
   * @param col La configuración de la columna
   * @returns El nombre del icono de Material a mostrar
   */
  getFileTypeIcon(element: any, col: any): string {
    if (col.key === 'fileIcon') {
      const contentType = element.contentType?.toLowerCase();
      if (!contentType || !col.fileTypeConfig?.iconMap) {
        return 'insert_drive_file';
      }
      // Primero intentamos con el tipo MIME completo
      let iconConfig = col.fileTypeConfig.iconMap[contentType];
      if (!iconConfig) {
        // Si no encontramos, intentamos con la extensión
        const extension = contentType.split('/')[1];
        iconConfig = col.fileTypeConfig.iconMap[extension] || col.fileTypeConfig.iconMap['default'];
      }
      return iconConfig?.icon || 'insert_drive_file';
    }
    return 'insert_drive_file';
  }

  getFileTypeIconColor(element: any, col: any): string {
    if (col.key === 'fileIcon') {
      const contentType = element.contentType?.toLowerCase();
      if (!contentType || !col.fileTypeConfig?.iconMap) {
        return '#757575';
      }
      // Primero intentamos con el tipo MIME completo
      let iconConfig = col.fileTypeConfig.iconMap[contentType];
      if (!iconConfig) {
        // Si no encontramos, intentamos con la extensión
        const extension = contentType.split('/')[1];
        iconConfig = col.fileTypeConfig.iconMap[extension] || col.fileTypeConfig.iconMap['default'];
      }
      return iconConfig?.color || '#757575';
    }
    return '#757575';
  }

  getFileTypeDisplayText(element: any, col: any): string {
    const contentType = element.contentType?.toLowerCase();
    if (!contentType) {
      return 'Archivo';
    }
    // Buscamos la configuración en la primera columna (fileIcon)
    const fileTypeConfig = this.config.columnsSchema.find(col => col.key === 'fileIcon')?.fileTypeConfig;
    if (!fileTypeConfig?.iconMap) {
      return 'Archivo';
    }
    // Primero intentamos con el tipo MIME completo
    let iconConfig = fileTypeConfig.iconMap[contentType];
    if (!iconConfig) {
      // Si no encontramos, intentamos con la extensión
      const extension = contentType.split('/')[1];
      iconConfig = fileTypeConfig.iconMap[extension] || fileTypeConfig.iconMap['default'];
    }
    return iconConfig?.displayText || 'Archivo';
  }
}
