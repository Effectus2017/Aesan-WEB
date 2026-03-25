import { ScrollingModule } from '@angular/cdk/scrolling';
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
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { OnGenericEditComponentHandler } from 'app/shared/components/generic-interfaces/generic-interfaces.interface';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { AgencyResponse } from 'app/shared/models/agency/AgencyResponse';
import { InscriptionResponse } from 'app/shared/models/agency/InscriptionResponse';
import { AgencyStatusResponse } from 'app/shared/models/agency/AgencyStatusResponse';
import { City } from 'app/shared/models/location/City';
import { OptionSelection } from 'app/shared/models/common/OptionSelection';
import { Program } from 'app/shared/models/program/Program';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { Region } from 'app/shared/models/location/Region';
import { UpdateAgencyInscriptionRequest } from 'app/shared/models/agency/UpdateAgencyInscriptionRequest';
import { AgencyService } from 'app/shared/services/agency.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GeoService } from 'app/shared/services/geo.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { StatusConfigModalComponent } from '../status-config-modal/status-config-modal.component';
import { AssignedToConfigModalComponent } from '../assigned-to-config-modal/assigned-to-config-modal.component';
import { AppointmentConfigModalComponent } from '../appointment-config-modal/appointment-config-modal.component';
import { compareById, compareItems, compareMonitors, comparePostal } from 'app/shared/utils';
import { READONLY_CENTERS_COLUMNS_SCHEMA, READONLY_SCHOOLS_COLUMNS_SCHEMA } from '../shared/readonly-school-columns-schema';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { School } from 'app/shared/models/school/School';
import { SitesBySchoolViewModalComponent } from '../sites-by-school-view-modal/sites-by-school-view-modal.component';

@Component({
  selector: 'app-aesan-sponsor-evaluation-view-pacna',
  templateUrl: './view-pacna.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    FormsModule,
    ScrollingModule,
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
    PhoneFormatDirective,
    PuertoRicoZipCodeDirective,
    LatitudeDirective,
    LongitudeDirective,
  ],
})
export class ViewPACNASponsorEvaluationComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler, OnGenericTableHandler {
  // -----------------------------------------------------------------------------------------------------
  // @ Subject de desuscripción
  // -----------------------------------------------------------------------------------------------------
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -----------------------------------------------------------------------------------------------------
  // @ Inyecciones privadas
  // -----------------------------------------------------------------------------------------------------
  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _geoService = inject(GeoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);
  private _notificationService = inject(NotificationService);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);

  // -----------------------------------------------------------------------------------------------------
  // @ Variables
  // -----------------------------------------------------------------------------------------------------
  listAgencyStatus: AgencyStatusResponse[] = [];
  listPrograms: Program[] = [];
  listCities: City[] = [];
  listRegions: Region[] = [];
  listPostalRegions: Region[] = [];
  listUsers: any[] = [];
  yesNoOptions: OptionSelection[] = [];
  exceptionStatusOptions: OptionSelection[] = [];
  taxExemptionTypeOptions: OptionSelection[] = [];
  typeOfEntityOptions: OptionSelection[] = [];
  typeOfApplicantOptions: OptionSelection[] = [];
  isDayCareHomeOptions: OptionSelection[] = [];
  boardExecutiveAuthorityOptions: OptionSelection[] = [];

  param: AgencyResponse;
  currentLang: string = 'es';

  compareById = compareById;
  compareItems = compareItems;
  compareMonitors = compareMonitors;
  comparePostal = comparePostal;

  headerConfig: GenericHeaderConfig = {
    title: 'sponsor-evaluation.edit.title',
    formGroup: this._formBuilder.group({
      name: [{ value: null, disabled: true }],
      status: [null],
      uieNumber: [{ value: null, disabled: true }],
      sdrNumber: [{ value: null, disabled: true }],
      einNumber: [{ value: null, disabled: true }],
      firstName: [{ value: null, disabled: true }],
      middleName: [{ value: null, disabled: true }],
      fatherLastName: [{ value: null, disabled: true }],
      motherLastName: [{ value: null, disabled: true }],
      email: [{ value: null, disabled: true }, Validators.email],
      phone: [{ value: null, disabled: true }],
      appointmentCoordinated: [null],
      appointmentDate: [null],
      rejectionJustification: [null],
      comments: [null],
      monitor: [null],
      isDayCareHomeId: [null],
      extendedHours: [null],
      servicesOfferedSince: [null],
      boardMeetingsPerYear: [null, [Validators.min(2)]],
      boardMeetsRegularly: [null],
      boardExecutiveAuthority: [[]],
      taxExemptionStatusId: [null],
      taxExemptionTypeId: [null],
      typeOfEntityId: [null],
      typeOfApplicantId: [null],
      publicAllianceContractId: [null],
      stateFundsDenied: [null],
      federalFundsDenied: [null],
      stateFundsDeniedReason: [null],
      federalFundsDeniedReason: [null],
      address: [null],
      zipCode: [null, [puertoRicoZipCodeValidator()]],
      city: [null],
      region: [null],
      latitude: [null],
      longitude: [null],
      postalAddress: [null],
      postalZipCode: [null, [puertoRicoZipCodeValidator()]],
      postalCity: [null],
      postalRegion: [null],
    }),
    saveButtonShow: false,
    settingsButtonShow: true,
    settingsButtonTooltip: 'sponsor-evaluation.edit.settings.tooltip',
    settingsMenuItems: [
      { id: 'edit-status', label: 'sponsor-evaluation.edit.settings.menuEditStatus', icon: 'mat_outline:label', iconColor: 'text-green-500' },
      { id: 'edit-assigned-to', label: 'sponsor-evaluation.edit.settings.menuEditAssignedTo', icon: 'mat_outline:person', iconColor: 'text-green-500' },
      { id: 'edit-appointment', label: 'sponsor-evaluation.edit.settings.menuEditAppointment', icon: 'heroicons_outline:calendar', iconColor: 'text-blue-500' },
      { id: 'go-to-calendar', label: 'global.menu.calendar', icon: 'heroicons_outline:calendar', iconColor: 'text-blue-500' },
    ],
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: READONLY_CENTERS_COLUMNS_SCHEMA,
    displayedColumns: READONLY_CENTERS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSizeOptions: [25, 50, 100],
    pageSize: 25,
    fullScreen: false,
  };

  centersTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: READONLY_CENTERS_COLUMNS_SCHEMA,
    displayedColumns: READONLY_CENTERS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSizeOptions: [25, 50, 100],
    pageSize: 25,
    fullScreen: false,
  };

  homesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    columnsSchema: READONLY_SCHOOLS_COLUMNS_SCHEMA,
    displayedColumns: READONLY_SCHOOLS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSizeOptions: [25, 50, 100],
    pageSize: 25,
    fullScreen: false,
  };

  centersData: School[] = [];
  homesData: School[] = [];

  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  /** Inicializa el componente, carga datos del resolver y configura validaciones del formulario. */
  ngOnInit(): void {
    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      const options = resolvedData.options ?? [];
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.listPrograms = resolvedData.programs;
      this.listAgencyStatus = resolvedData.agencyStatuses;
      this.listUsers = resolvedData.users;
      this.yesNoOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'yesNo');
      this.exceptionStatusOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'exceptionStatus');
      this.taxExemptionTypeOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'taxExemptionType');
      this.typeOfEntityOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'typeOfEntity');
      this.typeOfApplicantOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'typeOfApplicant');
      this.isDayCareHomeOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'isDayCareHome') ?? [];
      this.boardExecutiveAuthorityOptions = options.filter((opt: OptionSelection) => opt.optionKey === 'boardExecutiveAuthority') ?? [];

      this.currentLang = this._translocoService.getActiveLang();

      this.centersData = resolvedData.centers?.data ?? [];
      this.homesData = resolvedData.schools?.data ?? [];

      this.centersTableConfig.dataSource.data = this.centersData;
      this.centersTableConfig.length = resolvedData.centers?.count || this.centersData.length;

      this.homesTableConfig.dataSource.data = this.homesData;
      this.homesTableConfig.length = resolvedData.schools?.count || this.homesData.length;

      this.tableConfig = this.centersTableConfig;

      this.onSetForm(resolvedData.agency);
      this._changeDetectorRef.detectChanges();
    }
  }

  /** Limpia las suscripciones al destruir el componente. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones On (componentes genéricos)
  // -----------------------------------------------------------------------------------------------------
  /** Rellena el formulario con los datos de la agencia. */
  onSetForm(param: AgencyResponse): void {
    this.param = param;

    const hasPrograms = Array.isArray(param.programs) && param.programs.length > 0;
    if (!hasPrograms) {
      this._notificationService.showError(this._translocoService.translate('sponsor-evaluation.edit.messages.noProgramsAssigned'));
      this._customRouterService.navigate(['sponsor-evaluation']);
      return;
    }

    const inscription: InscriptionResponse = param.inscription;

    this.headerConfig.formGroup.patchValue({
      status: param.status,
      name: param.name || null,
      uieNumber: param.uieNumber || null,
      sdrNumber: param.sdrNumber || null,
      einNumber: param.einNumber || null,
      firstName: param.user?.firstName || null,
      middleName: param.user?.middleName || null,
      fatherLastName: param.user?.fatherLastName || null,
      motherLastName: param.user?.motherLastName || null,
      email: param.email || null,
      phone: param.phone || null,
      positionId: param.user?.position ?? null,
      appointmentCoordinated: param.appointmentCoordinated,
      appointmentDate: param.appointmentDate,
      rejectionJustification: param.rejectionJustification,
      monitor: null,
      isDayCareHomeId: inscription?.isDayCareHome ?? null,
      extendedHours: inscription?.extendedHours ?? null,
      servicesOfferedSince: inscription?.servicesOfferedSince || null,
      boardMeetingsPerYear: inscription?.boardMeetingsPerYear || null,
      boardMeetsRegularly: inscription?.boardMeetsRegularly ?? null,
      boardExecutiveAuthority: inscription?.boardExecutiveAuthority || [],
      taxExemptionStatusId: inscription?.taxExemptionStatus ?? null,
      taxExemptionTypeId: inscription?.taxExemptionType ?? null,
      typeOfEntityId: inscription?.typeOfEntity ?? null,
      typeOfApplicantId: inscription?.typeOfApplicant ?? null,
      publicAllianceContractId: inscription?.publicAllianceContract ?? null,
      stateFundsDenied: inscription?.stateFundsDenied ?? null,
      federalFundsDenied: inscription?.federalFundsDenied ?? null,
      stateFundsDeniedReason: inscription?.stateFundsDeniedReason || null,
      federalFundsDeniedReason: inscription?.federalFundsDeniedReason || null,
      address: param.address || null,
      zipCode: param.zipCode || null,
      city: param.city || null,
      region: param.region || null,
      latitude: param.latitude || null,
      longitude: param.longitude || null,
      postalAddress: param.postalAddress || null,
      postalZipCode: param.postalZipCode || null,
      postalCity: param.postalCity || null,
      postalRegion: param.postalRegion || null,
    });

    this.headerConfig.formGroup.disable({ onlySelf: false });
  }

  /** Guarda los cambios de la evaluación de la agencia. */
  onSave(): void {
    if (this.headerConfig.formGroup.invalid) {
      this._notificationService.showError(this._translocoService.translate('sponsor-evaluation.edit.messages.invalidForm'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.getRawValue();

    const agencyRequest: UpdateAgencyInscriptionRequest = {
      agencyId: this.param.id,
      statusId: formValues.status?.id,
      appointmentCoordinated: formValues.appointmentCoordinated,
      appointmentDate: formValues.appointmentDate,
      rejectionJustification: formValues.rejectionJustification,
    };

    this._agencyService.updateAgencyInscription(agencyRequest, null).subscribe({
      next: (response) => {
        if (response.body === true) {
          this._notificationService.showSuccessDialog();
        } else {
          this._notificationService.showErrorDialog();
        }
      },
      // error: el interceptor global ya muestra el diálogo de error
      error: () => {},
      complete: () => this._customRouterService.navigate(['sponsor-evaluation/list']),
    });
  }

  /** Maneja las acciones del menú de configuración (Editar Estatus, Asignado a, Cita). */
  onSettingsMenuAction(menuItemId: string): void {
    switch (menuItemId) {
      case 'edit-status': {
        const formValues = this.headerConfig.formGroup.getRawValue();
        const currentStatus = formValues.status;
        const dialogRef = this._dialog.open(StatusConfigModalComponent, {
          width: '500px',
          maxHeight: '90vh',
          data: { statuses: this.listAgencyStatus, currentStatus, agencyId: this.param.id },
        });
        dialogRef.afterClosed().subscribe((selectedStatus: AgencyStatusResponse | null) => {
          if (selectedStatus) {
            this.headerConfig.formGroup.patchValue({ status: selectedStatus });
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      }
      case 'edit-assigned-to': {
        const currentMonitor = this.headerConfig.formGroup.get('monitor')?.value;
        const dialogRef = this._dialog.open(AssignedToConfigModalComponent, {
          width: '500px',
          maxHeight: '90vh',
          data: { users: this.listUsers, currentUser: currentMonitor },
        });
        dialogRef.afterClosed().subscribe((selectedUser: any) => {
          if (selectedUser) {
            this.headerConfig.formGroup.patchValue({ monitor: selectedUser });
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      }
      case 'edit-appointment': {
        const dialogRef = this._dialog.open(AppointmentConfigModalComponent, {
          width: '600px',
          maxHeight: '90vh',
          data: {
            yesNoOptions: this.yesNoOptions,
            currentAppointmentCoordinated: this.headerConfig.formGroup.get('appointmentCoordinated')?.value,
            currentAppointmentDate: this.headerConfig.formGroup.get('appointmentDate')?.value,
            currentComments: this.headerConfig.formGroup.get('comments')?.value,
          },
        });
        dialogRef.afterClosed().subscribe((result: any) => {
          if (result) {
            this.headerConfig.formGroup.patchValue({
              appointmentCoordinated: result.appointmentCoordinated,
              appointmentDate: result.appointmentDate,
              comments: result.comments,
            });
            this._changeDetectorRef.markForCheck();
          }
        });
        break;
      }
      case 'go-to-calendar': {
        this._notificationService.showError(
          this._translocoService.translate('sponsor-evaluation.edit.messages.noSitesForVisitCalendar'),
          this._translocoService.translate('global.buttons.close')
        );
        break;
      }
      default:
        break;
    }
  }

  onSubmit(): void {}
  onReject(): void {}

  onTableAdd(event?: Event, tableId?: string): void {}

  /** Acción no disponible en modo de solo visualización. */
  onTableEdit(event: Event, _id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** Elimina un sitio (no implementado). */
  onTableDelete(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** Acción no disponible en modo de solo visualización. */
  onTableViewStaff(event: Event, _siteId: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** Acción no disponible en modo de solo visualización. */
  onTableCalendar(event: Event, _siteId: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** Abre el modal de sitios vinculados al centro/hogar seleccionado. */
  onTableSites(event: Event, schoolId: number): void {
    event.stopPropagation();
    event.preventDefault();
    const center = this.centersData.find((item) => item.id === schoolId);
    const home = this.homesData.find((item) => item.id === schoolId);
    const schoolName = center?.name ?? home?.name ?? '';
    const siteViewVariant = center ? 'pacna-centro' : 'pacna-hogar';
    this._dialog.open(SitesBySchoolViewModalComponent, {
      width: '80%',
      maxWidth: '1200px',
      data: {
        schoolId,
        schoolName,
        siteViewVariant,
        agency: this.param,
      },
    });
  }

  /** Maneja acciones de la tabla. */
  onTableAction(event: Event, _action: string, _id: number): void {
    event.stopPropagation();
    event.preventDefault();
    return;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Otras funciones públicas
  // -----------------------------------------------------------------------------------------------------
  /** Obtiene las ciudades según la región seleccionada. */
  getCitiesByRegionId(region: Region): void {
    this._geoService.getCitiesByRegionId({ regionId: region.id, alls: true }).subscribe({
      next: (response: HttpResponse<any>) => {
        this.listCities = response.body;
        this._changeDetectorRef.markForCheck();
      },
    });
  }

  /** Obtiene las regiones según la ciudad seleccionada. */
  getRegionsByCityId(city: City, target: string): void {
    if (!city) return;
    this._geoService.getRegionsByCityId({ cityId: city.id }).subscribe({
      next: (response: any) => {
        if (response?.body?.data) {
          if (target === 'region') {
            this.listRegions = response.body.data;
            this.headerConfig.formGroup.patchValue({
              region: this.listRegions.length === 1 ? this.listRegions[0] : null,
            });
          } else if (target === 'postalRegion') {
            this.listPostalRegions = response.body.data;
            this.headerConfig.formGroup.patchValue({
              postalRegion: this.listPostalRegions.length === 1 ? this.listPostalRegions[0] : null,
            });
          }
          this._changeDetectorRef.markForCheck();
        }
      },
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones privadas
  // -----------------------------------------------------------------------------------------------------
}
