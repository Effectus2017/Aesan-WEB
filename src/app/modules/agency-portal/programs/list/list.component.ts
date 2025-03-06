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

@Component({
  selector: 'agency-programs-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    NgFor,
    NgIf,
    TranslocoModule,
    SharedModule
  ],
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

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'navigation.programs.title',
  };

  programs: any[] = [];

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  constructor() {
    // Configurar el idioma activo
    this._translocoService.setActiveLang('es');

    // Suscribirse a los cambios de traducción para depuración
    this._translocoService.events$.subscribe(event => {
      console.log('Transloco event:', event);
    });

    // Verificar el idioma activo y las traducciones disponibles
    console.log('Active language:', this._translocoService.getActiveLang());
    console.log('Available languages:', this._translocoService.getAvailableLangs());
  }

  async ngOnInit(): Promise<void> {
    try {
      // Esperar a que las traducciones se carguen
      await firstValueFrom(this._translocoService.load('es'));
      console.log('Translations loaded successfully');

      // Asignar los datos después de cargar las traducciones
      this.programs = programCardsData;

      // Verificar las traducciones después de cargar los datos
      if (this.programs.length > 0) {
        const firstProgram = this.programs[0];
        console.log('First program data:', firstProgram);

        // Probar traducción del título
        const translatedTitle = this._translocoService.translate(firstProgram.title);
        console.log('First program translated title:', translatedTitle);

        // Probar traducción de una pregunta y sus respuestas
        if (firstProgram.questions && firstProgram.questions.length > 0) {
          const firstQuestion = firstProgram.questions[0];
          console.log('First question translation:', this._translocoService.translate(firstQuestion.title));

          if (Array.isArray(firstQuestion.answer)) {
            console.log('First question answers:', firstQuestion.answer.map(answer =>
              this._translocoService.translate(answer)
            ));
          } else {
            console.log('First question answer:', this._translocoService.translate(firstQuestion.answer));
          }
        }

        // Verificar traducción del botón "Leer más"
        console.log('Read more button translation:', this._translocoService.translate('common.read-more'));
      }

      this._changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('Error initializing component:', error);
    }
  }

  ngOnDestroy(): void {}

  onAdd(): void {}
}
