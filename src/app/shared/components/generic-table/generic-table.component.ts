import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
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

  /**
   * Método para manejar la adición de un elemento a la tabla.
   * Llama a la función onTableAdd del handler proporcionado.
   */
  onAdd(): void {
    this.handler.onTableAdd();
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

  /**
   * Maneja el error cuando una imagen no se puede cargar
   * @param event El evento de error
   * @param defaultImage La imagen por defecto a mostrar
   */
  handleMissingImage(event: Event, defaultImage: string): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = defaultImage || 'assets/images/avatars/profile.png';
  }
}
