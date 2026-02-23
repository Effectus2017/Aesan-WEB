import { Component, Input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { GenericFilterPanelComponent } from 'app/shared/components/generic-filter-panel/generic-filter-panel.component';
import { FilterSchema, OnGenericFilterHandlers } from 'app/shared/components/generic-filter-panel/generic-filter-panel.interface';
import { GenericFilterResult } from 'app/shared/components/generic-table/generic-table.interface';

/**
 * Contenedor que encapsula el drawer de filtros (fuse-drawer + cabecera + generic-filter-panel).
 * Simplifica el template del list: una sola etiqueta en lugar de repetir la estructura completa.
 */
@Component({
  selector: 'app-generic-filter-drawer',
  templateUrl: './generic-filter-drawer.component.html',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslocoModule, FuseDrawerComponent, GenericFilterPanelComponent],
})
export class GenericFilterDrawerComponent {
  @ViewChild('drawer') drawer!: FuseDrawerComponent;

  /** Schema de filtros (obligatorio cuando se usa este drawer para filtros con filtersSchema). */
  @Input() filtersSchema: FilterSchema[] = [];

  /** Handler que implementa OnGenericFilterHandlers (onFiltersApply, onFiltersReset). */
  @Input() handler?: OnGenericFilterHandlers;

  /** Valores actuales de filtros aplicados para rellenar el formulario al abrir. */
  @Input() initialValues: GenericFilterResult = {};

  /** Nombre único del drawer para Fuse (evita conflictos si hay varios en la página). */
  @Input() drawerName = 'genericFilterDrawer';

  toggle(): void {
    this.drawer?.toggle();
  }

  open(): void {
    this.drawer?.open();
  }

  close(): void {
    this.drawer?.close();
  }
}
