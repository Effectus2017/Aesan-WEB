import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ProgramRequest } from 'app/shared/models/program-request.types';
import { ProgramRequestService } from 'app/shared/services/program-request.service';
import { fuseAnimations } from '@fuse/animations';
import { UntypedFormBuilder } from '@angular/forms';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { programCardsData } from './columns-data';
import { ProgramService } from 'app/shared/services/program.service';
import { AuthService } from 'app/core/auth/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { SharedModule } from 'app/shared/shared.module';
import { firstValueFrom } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'agency-programs-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatMenuModule, NgFor, NgIf, TranslocoModule, SharedModule]
})
export class AgencyProgramsListComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<ProgramRequest>;

  private _formBuilder = inject(UntypedFormBuilder);
  private _programService: ProgramService = inject(ProgramService);
  private _authService: AuthService = inject(AuthService);
  private _programRequestService: ProgramRequestService = inject(ProgramRequestService);
  private _customRouterService = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);
  private _fuseConfirmationService = inject(FuseConfirmationService);

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'navigation.programs.title',
  };

  programs: any[] = [];

  constructor() {
    // Configurar el idioma activo
    this._translocoService.setActiveLang('es');

    // Suscribirse a los cambios de traducción para depuración
    this._translocoService.events$.subscribe((event) => {
      console.log('Transloco event:', event);
    });

    // Verificar el idioma activo y las traducciones disponibles
    console.log('Active language:', this._translocoService.getActiveLang());
    console.log('Available languages:', this._translocoService.getAvailableLangs());
  }

  ngOnInit() {
    this.programs = programCardsData;
    this._changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {}

  onAdd(): void {}

  /**
   * Muestra el diálogo de confirmación cuando el usuario solicita orientación
   * @param program El programa sobre el que se solicita orientación
   */
  requestOrientation(program: any): void {
    // Configuración del diálogo de confirmación
    const confirmation = this._fuseConfirmationService.open({
      title: this._translocoService.translate('common.notification'),
      message: this._translocoService.translate('common.orientation-request-sent'),
      icon: {
        show: true,
        name: 'heroicons_outline:information-circle',
        color: 'info',
      },
      actions: {
        confirm: {
          show: true,
          label: this._translocoService.translate('common.accept'),
          color: 'primary',
        },
        cancel: {
          show: false,
        },
      },
      dismissible: false,
    });

    // Opcional: Manejar la respuesta del diálogo
    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        console.log(`Solicitud de orientación para el programa ${program.id} confirmada`);
        // Aquí podríamos agregar lógica adicional si es necesario
      }
    });
  }

  // Método auxiliar para verificar si un valor es un array
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
}
