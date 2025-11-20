import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FuseConfigService } from '@fuse/services/config';
import { AuthService } from 'app/core/auth/auth.service';
import { isPSAVProgram } from 'app/shared/const';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { OnGenericEditComponentHandler } from 'app/shared/components/generic-interfaces/generic-interfaces.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { Agency } from 'app/shared/models/Agency';
import { AgencyStatus } from 'app/shared/models/AgencyStatus';
import { City } from 'app/shared/models/City';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { Program } from 'app/shared/models/Program';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { Region } from 'app/shared/models/Region';
import { UpdateAgencyInscriptionRequest } from 'app/shared/models/Request/AgencyRequest';
import { AgencyService } from 'app/shared/services/agency.service';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GeoService } from 'app/shared/services/geo.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { ProgramService } from 'app/shared/services/program.service';
import { SiteService } from 'app/shared/services/site.service';
import { SiteStaffService } from 'app/shared/services/site-staff.service';
import { SiteEditModalComponent, SiteEditModalData } from './site-edit-modal/site-edit-modal.component';
import { compareByProperty, compareItems, compareMonitors, comparePostal, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { SITES_COLUMNS_SCHEMA } from './columns-schema';

@Component({
    selector: 'app-aesan-sponsor-evaluation-edit',
    templateUrl: './edit.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        ReactiveFormsModule,
        FormsModule,
        TextFieldModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        MatCheckboxModule,
        MatRadioModule,
        MatTableModule,
        MatPaginatorModule,
        MatDividerModule,
        MatSnackBarModule,
        MatDialogModule,
        MatDatepickerModule,
        MatTooltipModule,
        GenericHeaderComponent,
        GenericTableComponent,
        TranslocoModule,
    ]
})
export class EditAesanSponsorEvaluationComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _agencyStatusService = inject(AgencyStatusService);
  private _geoService = inject(GeoService);
  private _programService = inject(ProgramService);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _notificationService = inject(NotificationService);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _fuseConfigService = inject(FuseConfigService);
  private _route = inject(ActivatedRoute);
  private _siteService = inject(SiteService);
  private _siteStaffService = inject(SiteStaffService);

  listAgencyStatus: AgencyStatus[] = [];
  listPrograms: Program[] = [];
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];
  listUsers: any[] = [];
  yesNoOptions: OptionSelection[] = [];
  exceptionStatusOptions: OptionSelection[] = [];
  taxExemptionTypeOptions: OptionSelection[] = [];
  // Campos de la cuarta fila
  typeOfEntityOptions: OptionSelection[] = [];
  typeOfApplicantOptions: OptionSelection[] = [];
  publicAllianceContractOptions: OptionSelection[] = [];
  isDayCareHomeOptions: OptionSelection[] = [];

  // Tabla de sitios relacionados a la agencia
  sitesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: SITES_COLUMNS_SCHEMA,
    displayedColumns: SITES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSizeOptions: [25, 50, 100],
    pageSize: 25,
  };

  // Configuración de tabla requerida por OnGenericTableHandler
  tableConfig: GenericTableConfig = this.sitesTableConfig;

  param: Agency;

  compareItems = compareItems;
  compareMonitors = compareMonitors;
  comparePostal = comparePostal;

  // Propiedad para determinar si la agencia tiene programa PSAV
  hasPSAVProgram: boolean = false;

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'sponsor-evaluation.edit.title',
    formGroup: this._formBuilder.group({
      // program: [{ value: null, disabled: true }], // Comentado temporalmente
      name: [{ value: null, disabled: true }],
      status: [null, Validators.required],
      // Datos de la IUE
      uieNumber: [{ value: null, disabled: true }],
      // Datos adicionales de la agencia
      sdrNumber: [{ value: null, disabled: true }],
      einNumber: [{ value: null, disabled: true }],
      // Datos del Contacto
      firstName: [{ value: null, disabled: true }],
      middleName: [{ value: null, disabled: true }],
      fatherLastName: [{ value: null, disabled: true }],
      motherLastName: [{ value: null, disabled: true }],

      // Datos del Administrador
      email: [{ value: null, disabled: true }, Validators.email],
      phone: [{ value: null, disabled: true }],
      // ¿Se coordinó cita con el auspiciador?
      appointmentCoordinated: [null, Validators.required],
      // Fecha de Cita
      appointmentDate: [null],
      // Justificación de Rechazo
      rejectionJustification: [null],
      // Comentarios
      comments: [null],
      // Monitor/Asignado a
      monitor: [null],
      // Campos de la tercera fila
      basicEducationRegistry: [null],
      taxExemptionStatusId: [null],
      taxExemptionTypeId: [null],
      // Campos de la cuarta fila
      typeOfEntityId: [null],
      typeOfApplicantId: [null],
      publicAllianceContractId: [null],
      // Campos de fondos denegados
      stateFundsDenied: [null],
      federalFundsDenied: [null],
      stateFundsDeniedReason: [null],
      federalFundsDeniedReason: [null],
      // Campos de dirección física
      address: [null, Validators.required],
      zipCode: [null, [Validators.required]],
      city: [null, Validators.required],
      region: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      // Copiar Dirección Física
      sameAsPhysicalAddress: [false],
      // Campos de dirección postal
      postalAddress: [null, Validators.required],
      postalZipCode: [null, Validators.required],
      postalCity: [null, Validators.required],
      postalRegion: [null, Validators.required],
    }),
    saveButtonText: 'global.buttons.save',
    saveButtonShow: true,
  };

  isDarkMode: boolean = false;

  constructor() {}

  ngOnInit() {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.listPrograms = resolvedData.programs;
      this.listAgencyStatus = resolvedData.agencyStatuses;
      this.listUsers = resolvedData.users;
      this.yesNoOptions = resolvedData.yesNoOptions;
      this.exceptionStatusOptions = resolvedData.exceptionStatusOptions;
      this.taxExemptionTypeOptions = resolvedData.taxExemptionTypeOptions;
      // AppointmentCoordinated options (usa yesNoOptions del backend)
      // Campos de la cuarta fila
      this.typeOfEntityOptions = resolvedData.typeOfEntityOptions;
      this.typeOfApplicantOptions = resolvedData.typeOfApplicantOptions;
      this.publicAllianceContractOptions = resolvedData.publicAllianceContractOptions;
      this.isDayCareHomeOptions = resolvedData.isDayCareHomeOptions || [];

      // Configurar tabla de sitios
      if (resolvedData.sites) {
        const sitesData = resolvedData.sites.data || resolvedData.sites;
        // Mapear sitios para incluir el nombre de la escuela
        const sitesWithSchoolName = Array.isArray(sitesData) ? sitesData.map((site: any) => ({
          ...site,
          schoolName: site.school?.name || site.schoolName || '-'
        })) : sitesData;
        this.sitesTableConfig.dataSource.data = sitesWithSchoolName;
        this.sitesTableConfig.length = resolvedData.sites.count || (Array.isArray(sitesData) ? sitesData.length : 0);
      }

      this.onSetForm(resolvedData.agency);
      this._changeDetectorRef.detectChanges();
    }

    // Agregar el observador para appointmentCoordinated
    this.headerConfig.formGroup.get('appointmentCoordinated').valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value: boolean) => {
        const appointmentDateControl = this.headerConfig.formGroup.get('appointmentDate');
        if (value === true) {
          appointmentDateControl.setValidators([Validators.required]);
        } else {
          appointmentDateControl.clearValidators();
        }
        appointmentDateControl.updateValueAndValidity();
      });

    // Suscribirse a los cambios del tema
    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.isDarkMode = config.scheme === 'dark' ? true : false;
        console.log('Tema actual:', config.scheme);
        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Agency) {
    this.param = param;

    if (isNullOrUndefinedEmptyStringNullArray(param.programs)) {
      this._notificationService.showError(this._translocoService.translate('sponsor-evaluation.edit.messages.noProgramsAssigned'));
      this._customRouterService.navigate(['sponsor-evaluation']);
      return;
    }

    // Verificar si la agencia tiene el programa PSAV
    this.hasPSAVProgram = param.programs.some((program) => isPSAVProgram(program));

    this.headerConfig.formGroup.patchValue({
      // program: param.programs || null, // Comentado temporalmente
      status: param.status,
      // Datos de la agencia
      name: param.name || null,
      uieNumber: param.uieNumber || null,
      // Datos adicionales de la agencia
      sdrNumber: param.sdrNumber || null,
      einNumber: param.einNumber || null,
      // Datos del Contacto
      firstName: param.user.firstName || null,
      middleName: param.user.middleName || null,
      fatherLastName: param.user.fatherLastName || null,
      motherLastName: param.user.motherLastName || null,
      // Datos del Administrador
      email: param.email || null,
      phone: param.phone || null,
      // Datos de la cita
      appointmentCoordinated: param.appointmentCoordinated,
      appointmentDate: param.appointmentDate,
      // Justificación de Rechazo
      rejectionJustification: param.rejectionJustification,
      // Monitor/Asignado a
      monitor: param.monitor || null,
      // Campos de la tercera fila
      basicEducationRegistry: param.inscription?.basicEducationRegistry || null,
      taxExemptionStatusId: param.inscription?.taxExemptionStatusId || null,
      taxExemptionTypeId: param.inscription?.taxExemptionTypeId || null,
      // Campos de la cuarta fila
      typeOfEntityId: param.inscription?.typeOfEntityId || null,
      typeOfApplicantId: param.inscription?.typeOfApplicantId || null,
      publicAllianceContractId: param.inscription?.publicAllianceContractId || null,
      // Campos de fondos denegados
      stateFundsDenied: param.inscription?.stateFundsDenied || null,
      federalFundsDenied: param.inscription?.federalFundsDenied || null,
      stateFundsDeniedReason: param.inscription?.stateFundsDeniedReason || null,
      federalFundsDeniedReason: param.inscription?.federalFundsDeniedReason || null,
      // Campos de dirección física
      address: param.address || null,
      zipCode: param.zipCode || null,
      city: param.city || null,
      region: param.region || null,
      latitude: param.latitude || null,
      longitude: param.longitude || null,
      // Copiar Dirección Física
      sameAsPhysicalAddress: false,
      // Campos de dirección postal
      postalAddress: param.postalAddress || null,
      postalZipCode: param.postalZipCode || null,
      postalCity: param.postalCity || null,
      postalRegion: param.postalRegion || null,
    });
  }

  /**
   * Guarda los cambios en la agencia
   */
  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._notificationService.showError(this._translocoService.translate('sponsor-evaluation.edit.messages.invalidForm'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }


    // Obtener los valores del formulario incluyendo los campos deshabilitados
    const formValues = this.headerConfig.formGroup.getRawValue();
    const statusId = formValues.status?.id;
    const appointmentCoordinated = formValues.appointmentCoordinated;
    const appointmentDate = formValues.appointmentDate;
    const rejectionJustification = formValues.rejectionJustification;

    // Construir el objeto de actualización
    const agencyRequest: UpdateAgencyInscriptionRequest = {
      agencyId: this.param.id,
      statusId: statusId,
      appointmentCoordinated: appointmentCoordinated,
      appointmentDate: appointmentDate,
      rejectionJustification: rejectionJustification,
    };

    // Llamar al servicio para actualizar
    this._agencyService.updateAgencyInscription(agencyRequest, null).subscribe({
      next: (response) => {
        switch (response.body) {
          case true:
            this._notificationService.showSuccessDialog();
            break;
          default:
            this._notificationService.showErrorDialog();
            break;
        }
      },
      error: (error) => {
        this._notificationService.showErrorDialog();
      },
      complete: () => {
        this._customRouterService.navigate([`sponsor-evaluation/list`]);
      },
    });
  }

  // Método para obtener todas las ciudades según el ID de la región
  getCitiesByRegionId(region: Region): void {
    const queryParams: QueryParameters = {
      regionId: region.id,
      alls: true,
    };

    this._geoService.getCitiesByRegionId(queryParams).subscribe({
      next: (response: HttpResponse<any>) => {
        this.listCities = response.body;
      },
      error: (error) => {
        console.error('Error al cargar las ciudades:', error);
      },
      complete: () => {
        // Complete callback
      },
    });
  }

  // Método para obtener todas las regiones según el ID de la ciudad
  getRegionsByCityId(city: City, target: string): void {
    if (!city) return;

    const queryParameters: QueryParameters = {
      cityId: city.id,
    };

    this._geoService.getRegionsByCityId(queryParameters).subscribe({
      next: (response) => {
        if (response?.body?.data) {
          if (target === 'region') {
            this.listRegions = response.body.data;
            const regionControl = this.headerConfig.formGroup.get('region');

            if (regionControl) {
              if (this.listRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Física
                this.headerConfig.formGroup.patchValue({ region: this.listRegions[0] });
              } else {
                regionControl.setValue(null);
              }
            }
          } else if (target === 'postalRegion') {
            this.listPostalRegions = response.body.data;
            const regionControl = this.headerConfig.formGroup.get('postalRegion');

            if (regionControl) {
              if (this.listPostalRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Postal
                this.headerConfig.formGroup.patchValue({ postalRegion: this.listPostalRegions[0] });
              } else {
                regionControl.setValue(null);
              }
            }
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar las regiones:', error);
      },
    });
  }

  // Copiar Dirección Física
  // Si el checkbox está marcado, copiar los valores de la dirección física a la postal
  // Si el checkbox no está marcado, limpiar los campos de la dirección postal
  onCheckboxChange(event: any): void {
    if (event.checked) {
      // Primero asignamos los valores básicos
      this.headerConfig.formGroup.patchValue({
        postalAddress: this.headerConfig.formGroup.value.address,
        postalCity: this.headerConfig.formGroup.value.city,
        postalZipCode: this.headerConfig.formGroup.value.zipCode,
      });

      // Si hay una ciudad seleccionada, obtenemos sus regiones
      if (this.headerConfig.formGroup.value.city) {
        this.getRegionsByCityId(this.headerConfig.formGroup.value.city, 'postalRegion');
      }

      this.headerConfig.formGroup.updateValueAndValidity();
    } else {
      this.headerConfig.formGroup.patchValue({
        postalAddress: '',
        postalCity: '',
        postalRegion: '',
        postalZipCode: '',
      });
    }
  }

  // Método para obtener la ubicación actual usando GPS
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.headerConfig.formGroup.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          this._snackBar.open('Error al obtener la ubicación GPS', 'Cerrar', { duration: 3000 });
        }
      );
    } else {
      this._snackBar.open('Geolocalización no soportada por este navegador', 'Cerrar', { duration: 3000 });
    }
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
          this._notificationService.showSuccessDialog();
        }
      },
      error: (error) => {
        this._notificationService.showErrorDialog();
      },
      complete: () => {
        this._customRouterService.navigate([`sponsor-evaluation/list`]);
      },
    });
  }

  /**
   * Rechaza la agencia
   */
  onReject() {}

  compareItemPrograms<T>(item1: T, item2: T): boolean {
    return compareByProperty(item1, item2, 'id' as keyof T);
  }

  // Métodos requeridos por OnGenericTableHandler
  onTableAdd(event?: Event, tableId?: string): void {
    // Implementar lógica para agregar nueva escuela si es necesario
    console.log('Agregar escuela');
  }

  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.openSiteEditModal(id);
  }

  onTableDelete(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    // Implementar lógica de eliminación si es necesario
    console.log('Eliminar escuela', id);
  }

  openSiteEditModal(siteId: number): void {
    const queryParameters: QueryParameters = {
      id: siteId,
    };

    this._siteService.getSiteById(queryParameters).subscribe({
      next: (response: any) => {
        if (response?.body) {
          const site = response.body;
          const modalData: SiteEditModalData = {
            site: site,
            agency: this.param,
          };

          const dialogRef = this._dialog.open(SiteEditModalComponent, {
            width: '90vw',
            maxWidth: '1200px',
            data: modalData,
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              // Refrescar tabla de sitios
              this.refreshSitesTable();
            }
          });
        }
      },
      error: (error) => {
        this._notificationService.showError('Error al cargar el sitio');
        console.error('Error loading site:', error);
      },
    });
  }

  openStaffBySiteModal(siteId: number): void {
    const queryParameters: QueryParameters = {
      siteId: siteId,
    };

    this._siteStaffService.getStaffBySite(queryParameters).subscribe({
      next: (response: any) => {
        if (response?.body) {
          const staffList = response.body.data || response.body;
          // Importar dinámicamente el modal para evitar dependencia circular
          import('./staff-by-site-modal/staff-by-site-modal.component').then((module) => {
            this._dialog.open(module.StaffBySiteModalComponent, {
              width: '90vw',
              maxWidth: '1200px',
              data: {
                siteId: siteId,
                staffList: staffList,
              },
            });
          });
        }
      },
      error: (error) => {
        this._notificationService.showError('Error al cargar el personal del sitio');
        console.error('Error loading staff by site:', error);
      },
    });
  }

  private refreshSitesTable(): void {
    const queryParameters: QueryParameters = {
      agencyId: this.param?.id || this._authService.getAgencyId(),
    };
    this._siteService.getAllSitesFromDb(queryParameters).subscribe({
      next: (response: any) => {
        if (response?.body) {
          const sitesData = response.body.data || response.body;
          // Mapear sitios para incluir el nombre de la escuela
          const sitesWithSchoolName = Array.isArray(sitesData) ? sitesData.map((site: any) => ({
            ...site,
            schoolName: site.school?.name || site.schoolName || '-'
          })) : sitesData;
          this.sitesTableConfig.dataSource.data = sitesWithSchoolName;
          this.sitesTableConfig.length = response.body.count || (Array.isArray(sitesData) ? sitesData.length : 0);
          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error refreshing sites table:', error);
      },
    });
  }

  onTableViewStaff(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.openStaffBySiteModal(id);
  }

  onTableAction(event: Event, action: string, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    switch (action) {
      case 'view':
        this._customRouterService.navigate([`sites/view/${id}`]);
        break;
      case 'edit':
        this.openSiteEditModal(id);
        break;
      default:
        console.log('Acción no implementada:', action);
    }
  }
}
