import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { Subject } from 'rxjs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { OnGenericAddComponentHandler } from 'app/shared/components/generic-interfaces/generic-interfaces.interface';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AgencyService } from 'app/shared/services/agency.service';
import { AgencyResponse } from 'app/shared/models/agency/AgencyResponse';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { AgencyRequest } from 'app/shared/models/agency/AgencyRequest';
import { compareByProperty } from 'app/shared/utils';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { City } from 'app/shared/models/location/City';
import { HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { INCOME_SOURCES_COLUMNS_SCHEMA, SCHOOLS_COLUMNS_SCHEMA } from './columns-schema';
import { incomeSourcesData, schoolsColumnsData } from './columns-data';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { AddSchoolDialogComponent } from '../add-school-dialog/add-school-dialog.component';
import { AddIncomeSourceDialogComponent } from '../add-income-source-dialog/add-income-source-dialog.component';
import { UserAgencyRequest } from 'app/shared/models/agency/UserAgencyRequest';
import { UserRequest } from 'app/shared/models/request/UserRequest';


@Component({
    selector: 'app-agency-program-requests-add',
    templateUrl: './add.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
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
        MatPaginatorModule,
        NgFor,
        GenericHeaderComponent,
        TranslocoModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTooltipModule,
        NgIf,
        GenericTableComponent,
    ]
})
export class AddProgramRequestComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericAddComponentHandler, OnGenericTableHandler {
  @ViewChild('schoolsTable') schoolsTable: GenericTableComponent;
  @ViewChild('incomeSourcesTable') incomeSourcesTable: GenericTableComponent;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _geoService = inject(GeoService);
  private _userService = inject(UserService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);

  // Información de solo lectura
  agencyInfo = {
    name: 'FONDITA DE JUAN',
    uieNumber: '7454839948',
    address: 'calle Esperanza Urb. Corazón',
    city: 'Caguas',
    region: 'San Juan',
    zipCode: '00123',
    user: {
      firstName: 'JUAN',
      middleName: 'PABLO',
      fatherLastName: 'DEL PUEBLO',
      motherLastName: 'DÍAZ',
    },
    adminTitle: 'Encargado de Cocina',
    phone: '809-555-1234',
    program: 'PDAM',
  };

  listAgencyStatus = [];
  listPrograms = [];
  listCities = [];
  listRegions = [];

  // Entidades
  listEntities = [
    {
      id: 1,
      name: 'Publico',
    },
    {
      id: 2,
      name: 'Privado',
    },
  ];

  // Exenciones
  listTaxExemptionTypes = [
    {
      id: 1,
      name: 'Federal',
    },
    {
      id: 2,
      name: 'Estatal',
    },
  ];

  // Exenciones
  listExemptionStatus = [
    {
      id: 1,
      name: 'Otorgada',
    },
    {
      id: 2,
      name: 'En Proceso',
    },
  ];

  // Certificación de Educación Básica
  listBasicEducationCertifications = [
    {
      id: 1,
      name: 'Autoridad Escolar de Alimentos del Departamento de Educación',
    },
    {
      id: 2,
      name: 'Autoridad Escolar de Alimentos Independiente',
    },
  ];

  // Políticas de Funcionamiento
  listFunctioningPolicies = [
    {
      id: 1,
      name: 'Gratis/Reducido',
    },
    {
      id: 2,
      name: 'Pagando',
    },
    {
      id: 3,
      name: 'Provisión 1',
    },
    {
      id: 4,
      name: 'Provisión 2',
    },
    {
      id: 5,
      name: 'Provisión 3',
    },
  ];

  // Derechos Civiles
  listOfCivilRightsSurvey = [
    {
      id: 1,
      name: 'Sí',
    },
    {
      id: 2,
      name: 'No',
    },
  ];

  // Material Informativo
  listOfInformativeMaterial = [
    {
      id: 1,
      name: 'Sí',
    },
    {
      id: 2,
      name: 'No',
    },
  ];

  // Intérpreta
  listOfInterpretersNeeded = [
    {
      id: 1,
      name: 'Sí',
    },
    {
      id: 2,
      name: 'No',
    },
  ];

  // Medios alternativos para la comunicación
  listOfAlternativeCommunicationMedia = [
    {
      id: 1,
      name: 'Sí',
    },
    {
      id: 2,
      name: 'No',
    },
  ];

  listOfAlternativeCommunicationMediaTypes = [
    {
      id: 1,
      name: 'Sistema Braile',
    },
    {
      id: 2,
      name: 'Letras Grandes',
    },
    {
      id: 3,
      name: 'Cinta de Audio',
    },
    {
      id: 4,
      name: 'Otros',
    },
  ];

  listOfDocumentTypes = [
    {
      id: 1,
      name: 'Lista de Participantes',
    },
    {
      id: 2,
      name: 'Plan de Actividades',
    },
    {
      id: 3,
      name: 'Menú a Utilizar',
    },
  ];

  param: AgencyResponse;

  temporarySchools: any[] = [];
  temporaryIncomeSources: any[] = [];

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'Solicitud al Programa',
    formGroup: this._formBuilder.group({
      // Tax Exemption
      taxExemptionType: [''],
      taxExemptionStatus: [''],

      entity: [''],
      schools: [''],
      functioningPolicy: [''],

      // Program Participation
      participationType: ['', Validators.required],
      operatingPolicy: [''],
      organizationType: ['', Validators.required],

      // Additional Information
      basicEducationCertification: [''],
      aeaDesignedMenu: [false],
      civilRightsSurveyCompleted: [null],
      // Material Informativo
      informativeMaterialNeeded: [null],
      informativeMaterialLanguage: [null],
      // Intérpreta
      interpretersNeeded: [null],
      interpretersLanguage: [null],
      // Medios alternativos para la comunicación
      alternativeCommunicationMedia: [null],
      alternativeCommunicationMediaType: [null],

      // Porcentajes
      freePercentage: [null],
      reducedPercentage: [null],
      subTotalPercentage: [null],
      paidPercentage: [null],
      // Documentos
      documentType: [null],
    }),
    submitButtonShow: false,
    saveButtonShow: false,
    rejectButtonShow: false,
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    addMenuShow: true,
    addMenuItems: [
      {
        id: 'add',
        label: 'global.buttons.addSchool',
      },
    ],
    addMenuTooltip: 'global.tooltips.addSchool',
    fullScreen: true,
  };

  tableConfigIncomeSources: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: INCOME_SOURCES_COLUMNS_SCHEMA,
    displayedColumns: INCOME_SOURCES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    addMenuShow: true,
    addMenuItems: [
      {
        id: 'add',
        label: 'global.buttons.addSchool',
      },
    ],
    addMenuTooltip: 'global.tooltips.addSchool',
  };

  private _activeTable: 'schools' | 'incomeSources' = 'schools';

  constructor() {}

  ngOnInit() {
    this.tableConfig.dataSource.data = schoolsColumnsData;
    this.tableConfigIncomeSources.dataSource.data = incomeSourcesData;
    this._activeTable = 'schools';
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: AgencyResponse) {
    console.log(param);
    this.param = param;
    this.headerConfig.formGroup.patchValue({
      name: param.name || null,
    });
  }

  /**
   * Guarda los cambios en la agencia
   */
  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 5000,
      });

      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Obtener los valores del formulario
    const formValues = this.headerConfig.formGroup.value;

    // Construir el objeto de actualización
    const agencyRequest: AgencyRequest = {
      name: formValues.name,
      //   CityId: formValues.city?.id,
      //   RegionId: formValues.region?.id,
      //   StatusId: formValues.status?.id,
      //   SdrNumber: formValues.sdrNumber,
      //   UieNumber: formValues.uieNumber,
      //   EinNumber: formValues.einNumber,
      //   Address: formValues.address,
      //   ZipCode: formValues.zipCode,
      //   PostalAddress: formValues.postalAddress,
      //   Email: formValues.email,
      //   Phone: formValues.phone,
      //   FirstName: formValues.firstName,
      //   MiddleName: formValues.middleName,
      //   FatherLastName: formValues.fatherLastName,
      //   MotherLastName: formValues.motherLastName,
      //   AdministrationTitle: formValues.administrationTitle,
      //   //
      //   Programs: formValues.program ? formValues.program.map((program: any) => program.id) : [],
    };

    const userRequest: UserRequest = {
      id: this.param.user.id?.toString(),
      firstName: formValues.firstName,
      middleName: formValues.middleName,
      fatherLastName: formValues.fatherLastName,
      motherLastName: formValues.motherLastName,
      email: formValues.email,
      administrationTitle: formValues.administrationTitle,
    };

    const userAgencyRequest: UserAgencyRequest = {
      agency: agencyRequest,
      //user: userRequest,
    };

    // Parámetros de consulta
    const queryParams: QueryParameters = {
      agencyId: this.param.id,
    };

    // Llamar al servicio para actualizar
    this._agencyService.updateAgency(userAgencyRequest, queryParams).subscribe({
      next: (response) => {
        if (response.body) {
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('dialog.success.title'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            message: this._translocoService.translate('dialog.success.message'),
            actions: {
              confirm: {
                label: this._translocoService.translate('dialog.success.confirm'),
              },
              cancel: {
                show: false,
              },
            },
          });
        } else {
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('dialog.error.title'),
            icon: {
              show: true,
              name: 'heroicons_outline:x-circle',
              color: 'error',
            },
            message: this._translocoService.translate('dialog.error.message'),
            actions: {
              confirm: {
                label: this._translocoService.translate('dialog.error.confirm'),
              },
              cancel: {
                show: false,
              },
            },
          });
        }
      },
      error: (error) => {
        console.error('Error al crear la solicitud:', error);
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        console.log('Actualización completada');
        this.headerConfig.formGroup.enable();

        const queryParams: QueryParameters = {
          agencyId: this.param.id,
        };

        this._agencyService.getAgencyById(queryParams).subscribe();
      },
    });
  }

  /**
   * Guarda los cambios en la agencia
   */
  onSubmit() {
    const queryParams: QueryParameters = {
      agencyId: this.param.id,
      statusId: 7, // Suponiendo que 7 es el ID para aprobar la agencia
    };

    this._agencyService.updateAgencyStatus(queryParams).subscribe({
      next: (response) => {
        if (response.body) {
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('dialog.success.title'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            message: this._translocoService.translate('dialog.success.message'),
            actions: {
              confirm: {
                label: this._translocoService.translate('dialog.success.confirm'),
              },
              cancel: {
                show: false,
              },
            },
          });
        }
      },
      error: (error) => {
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('dialog.error.title'),
          icon: {
            show: true,
            name: 'heroicons_outline:exclamation-circle',
            color: 'error',
          },
          message: this._translocoService.translate('dialog.error.message'),
          actions: {
            confirm: {
              label: this._translocoService.translate('dialog.error.confirm'),
            },
            cancel: {
              show: false,
            },
          },
        });
      },
      complete: () => {
        const queryParams: QueryParameters = {
          agencyId: this.param.id,
        };

        this._agencyService.getAgencyById(queryParams).subscribe();
      },
    });
  }

  /**
   * Rechaza la agencia
   */
  onReject() {
    //this.showRejectDialog();
  }

  // Método para obtener todas las regiones según el ID de la ciudad
  getRegionsByCityId(city: City): void {
    const queryParams: QueryParameters = {
      cityId: city.id,
      alls: true,
    };

    this._geoService.getRegionsByCityId(queryParams).subscribe({
      next: (response: HttpResponse<any>) => {
        this.listRegions = response.body.data;
      },
      error: (error) => {
        console.error('Error al cargar las regiones', error);
      },
      complete: () => {
        console.log('Regiones cargadas con éxito');
      },
    });
  }

  // Función única para comparar diferentes tipos de elementos
  compareItems<T>(item1: T, item2: T): boolean {
    return compareByProperty(item1, item2, 'id' as keyof T);
  }

  onAdd() {
    console.log('onAdd');
  }

  // -----------------------------------------------------------------------------------------------------
  // Métodos para manejar la tabla
  // -----------------------------------------------------------------------------------------------------

  /**
   * Maneja las acciones del menú de agregar
   */
  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.onTableAdd();
    }
  }

  onTableAdd() {
    // Determinar qué tabla está activa basado en el evento del botón
    const isSchoolTable = false;

    if (isSchoolTable) {
      const dialogRef = this._dialog.open(AddSchoolDialogComponent, {
        data: {
          schoolId: 0,
          isTemporary: true,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.temporarySchools.push(result);
          this.tableConfig.dataSource.data = this.temporarySchools;
          this._changeDetectorRef.markForCheck();
        }
      });
    } else {
      const dialogRef = this._dialog.open(AddIncomeSourceDialogComponent, {
        data: {
          id: 0,
          isTemporary: true,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.temporaryIncomeSources.push(result);
          this.tableConfigIncomeSources.dataSource.data = this.temporaryIncomeSources;
          this._changeDetectorRef.markForCheck();
        }
      });
    }
  }

  onTableEdit(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();

    // Determinar qué tabla está activa basado en el evento del botón
    const isSchoolTable = this.tableConfig.dataSource === this.schoolsTable?.config?.dataSource;

    if (isSchoolTable) {
      const schoolToEdit = this.temporarySchools.find((school) => school.id === id);
      if (!schoolToEdit) return;

      const dialogRef = this._dialog.open(AddSchoolDialogComponent, {
        data: {
          ...schoolToEdit,
          isTemporary: true,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          const index = this.temporarySchools.findIndex((school) => school.id === id);
          if (index !== -1) {
            this.temporarySchools[index] = result;
            this.tableConfig.dataSource.data = [...this.temporarySchools];
            this._changeDetectorRef.markForCheck();
          }
        }
      });
    } else {
      const incomeSourceToEdit = this.temporaryIncomeSources.find((source) => source.id === id);
      if (!incomeSourceToEdit) return;

      const dialogRef = this._dialog.open(AddIncomeSourceDialogComponent, {
        data: {
          ...incomeSourceToEdit,
          isTemporary: true,
        },
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          const index = this.temporaryIncomeSources.findIndex((source) => source.id === id);
          if (index !== -1) {
            this.temporaryIncomeSources[index] = result;
            this.tableConfigIncomeSources.dataSource.data = [...this.temporaryIncomeSources];
            this._changeDetectorRef.markForCheck();
          }
        }
      });
    }
  }

  onTableDelete(event: Event, id: number) {
    event.stopPropagation();
    event.preventDefault();

    // Determinar qué tabla está activa basado en el evento del botón
    const isSchoolTable = this.tableConfig.dataSource === this.schoolsTable?.config?.dataSource;

    if (isSchoolTable) {
      this.temporarySchools = this.temporarySchools.filter((school) => school.id !== id);
      this.tableConfig.dataSource.data = this.temporarySchools;
      this._changeDetectorRef.markForCheck();
    } else {
      this.temporaryIncomeSources = this.temporaryIncomeSources.filter((source) => source.id !== id);
      this.tableConfigIncomeSources.dataSource.data = this.temporaryIncomeSources;
      this._changeDetectorRef.markForCheck();
    }
  }

  // Método para cambiar la tabla activa
  setActiveTable(table: 'schools' | 'incomeSources') {
    this._activeTable = table;
  }
}
