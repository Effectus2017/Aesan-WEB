import { Component, Input, Output, EventEmitter, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { GenericTableConfig, OnGenericTableHandler } from './generic-table.interface';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatCheckboxModule, TranslocoModule],
})
export class GenericTableComponent implements OnInit {
  @Input() config: GenericTableConfig;
  @Input() handler: OnGenericTableHandler;

  ngOnInit(): void {

  }

  // Functions
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  onEdit(event: Event, id: number): void {
    this.handler.onEdit(event, id);
  }

  onDelete(event: Event, id: number): void {
    this.handler.onDelete(event, id);
  }

  onCheckboxChange(event: MatCheckboxChange, element: any, key: string): void {
    // Actualiza el valor usando el mismo método que usas para establecer valores anidados
    //this.getNestedValue(element, key, event.checked);
    //this.handler.onCheckboxChange(event, element, key);
  }

  /**
   * Esta función se encarga de manejar el cambio de estado de un checkbox en la tabla.
   *
   * @param event El evento de cambio del checkbox.
   * @param element El elemento de la fila que contiene el checkbox.
   * @param key La clave del valor a cambiar en el elemento.
   */
  getNestedValue(element: any, path: string | string[]): any {
    if (Array.isArray(path)) {
      return path.map(p => this.getNestedValue(element, p)).join(' ');
    }
    return path.split('.').reduce((obj, key) =>
      (obj && obj[key] !== undefined) ? obj[key] : undefined, element);
  }

  /**
   * Esta función se encarga de obtener el valor de una propiedad anidada en un objeto.
   * Si el path es un arreglo, se concatenan los valores de las propiedades anidadadas
   * separados por un espacio.
   *
   * @param element El objeto que contiene las propiedades anidadadas.
   * @param path El camino a la propiedad anidada. Puede ser una cadena o un arreglo de cadenas.
   * @returns El valor de la propiedad anidada o undefined si no se encuentra.
   */
  getColumnDef(col: any): string {
    if (!col || !col.key) {
      return '';
    }
    return Array.isArray(col.key) ? col.key[0] : col.key;
  }

}
