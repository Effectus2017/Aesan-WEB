import { TextFieldModule } from '@angular/cdk/text-field';
import { NgFor, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { Subject, takeUntil } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { OnGenericEditComponentHandler } from 'app/shared/components/generic-interfaces/generic-interfaces.interface';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AgencyService } from 'app/shared/services/agency.service';
import { Agency } from 'app/shared/models/Agency';
import { GeoService } from 'app/shared/services/geo.service';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AuthService } from 'app/core/auth/auth.service';
import { NgClass } from '@angular/common';
import { FuseConfigService } from '@fuse/services/config';
import { ProgramService } from 'app/shared/services/program.service';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { PDAM_SOLICITUD_COLUMNS_SCHEMA } from './columns-schema';
import { PDAM_SOLICITUD_DATA } from './columns-data';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'app-agency-pdam-solicitud',
    templateUrl: './pdam-solicitud.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgFor,
        NgClass,
        DecimalPipe,
        MatIconModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        TextFieldModule,
        MatDividerModule,
        MatCheckboxModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        MatRadioModule,
        MatTableModule,
        GenericHeaderComponent,
        TranslocoModule,
        MatSnackBarModule,
        MatDialogModule,
        MatDatepickerModule,
        MatDividerModule,
        GenericTableComponent,
        MatPaginatorModule,
    ]
})
export class AgencyPDAMSolicitudComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Campos de solo lectura que vienen de la intención de participación
  sponsorName: string;
  representativeName: string;
  programPersons: string;
  postalAddress: string;
  physicalAddress: string;
  phoneNumber: string;
  uieNumber: number;
  corporationNumber: number;
  employerNumber: number;
  latitude: number;
  longitude: number;
  vision: string;
  mission: string;
  objectives: string;
  participationType: number;

  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _geoService = inject(GeoService);
  private _programService = inject(ProgramService);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);
  private _customRouterService = inject(CustomRouterService);
  private _fuseConfigService = inject(FuseConfigService);

  listParticipationType = [
    { id: 1, name: 'Autoridad Escolar de Alimentos del Departamento de Educación' },
    { id: 2, name: 'Autoridad Escolar de Alimentos Independiente' }
  ];

  listNutritionDivision = [
    { id: 1, name: 'Si', value: true },
    { id: 2, name: 'No', value: false }
  ];

  listYesNo = [
    { id: 1, name: 'Si', value: true },
    { id: 2, name: 'No', value: false }
  ];

  listRequestType = [
    { id: 1, name: 'Nueva' },
    { id: 2, name: 'Renovación' }
  ];

  param: Agency;

  // Configuración de la tabla
  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: PDAM_SOLICITUD_COLUMNS_SCHEMA,
    displayedColumns: PDAM_SOLICITUD_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
  };

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'agency-pdam.title',
    formGroup: this._formBuilder.group({
      // Visión y Misión
      vision: ['', Validators.required],
      mission: ['', Validators.required],
      objectives: ['', Validators.required],

      // Tipo de Participación
      participationType: [null, Validators.required],

      // División de Nutrición
      menuDesignedByAEA: [null, Validators.required],

      // Programas adicionales
      federalFoodProgram: [false],
      specialMilkProgram: [false],
      farmToSchoolProgram: [false],
      summerEBTProgram: [false],
      farmToSummerProgram: [false],
      freshFruitsProgram: [false],

      // Derechos Civiles
      needsOtherLanguages: [null, Validators.required],
      needsOtherLanguagesExplanation: [null],
      needsInterpreter: [null, Validators.required],
      needsInterpreterExplanation: [null],
      alternativeMeans: this._formBuilder.group({
        braille: [false],
        audio: [false],
        largeText: [false],
        signLanguage: [false],
        other: [false]
      }),
      preAward: [null, Validators.required],
      informedPersons: [null, Validators.required],
      informedDate: [null],
      explanation: [null],
      relayService: [null, Validators.required]
    }),

  };

  isDarkMode: boolean = false;

  constructor() {}

  ngOnInit() {

    this.tableConfig.dataSourceList = PDAM_SOLICITUD_DATA;
    this.tableConfig.dataSource.data = this.tableConfig.dataSourceList;

    // Suscribirse a los cambios del tema
    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.isDarkMode = config.scheme === 'dark';
        this._changeDetectorRef.markForCheck();
      });

    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.onSetForm(result.body);
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Agency) {
    this.param = param;
    this.sponsorName = param.name;
    this.representativeName = param.user?.firstName + ' ' + param.user?.fatherLastName;
    this.programPersons = param.monitor?.firstName + ' ' + param.monitor?.fatherLastName;
    this.postalAddress = param.postalAddress;
    this.physicalAddress = param.address;
    this.phoneNumber = param.phone;
    this.uieNumber = param.uieNumber;
    this.corporationNumber = param.sdrNumber;
    this.employerNumber = param.einNumber;
    this.latitude = param.latitude;
    this.longitude = param.longitude;
    this.vision = '';
    this.mission = '';
    this.participationType = this.listParticipationType[0].id;
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 5000,
      });
      return;
    }

    const formValue = this.headerConfig.formGroup.getRawValue();


  }

  onSubmit() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 5000,
      });
      return;
    }

    const formValue = this.headerConfig.formGroup.getRawValue();

    // Mostrar diálogo de confirmación
    const dialogRef = this._fuseConfirmationService.open({
      title: 'Confirmar envío',
      message: '¿Está seguro que desea enviar el formulario para aprobación?',
      actions: {
        confirm: {
          label: 'Sí, enviar',
        },
        cancel: {
          label: 'No',
        },
      },
    });

    // Suscribirse a la respuesta del diálogo
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        // Aquí iría la lógica para enviar el formulario
        this._snackBar.open('Formulario enviado correctamente', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  getPaginator(event: PageEvent): void {
    const pageIndex = !isNullOrUndefinedEmptyStringNullArray(event.pageIndex) ? event.pageIndex : 0;
    this.tableConfig.pageSize = event.pageSize;
    // Aquí iría la lógica de paginación real
    console.log('Página:', pageIndex, 'Tamaño:', event.pageSize);
  }
}
