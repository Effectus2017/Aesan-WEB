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
import { AuthService } from 'app/core/auth/auth.service';
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
import { SiteService } from 'app/shared/services/site.service';
import { SiteStaffService } from 'app/shared/services/site-staff.service';
import { SiteEditModalComponent, SiteEditModalData } from '../site-edit-modal/site-edit-modal.component';
import { StatusConfigModalComponent } from '../status-config-modal/status-config-modal.component';
import { AssignedToConfigModalComponent } from '../assigned-to-config-modal/assigned-to-config-modal.component';
import { AppointmentConfigModalComponent } from '../appointment-config-modal/appointment-config-modal.component';
import { compareById, compareItems, compareMonitors, comparePostal, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { PACNA_SITES_COLUMNS_SCHEMA } from './columns-schema';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';

@Component({
  selector: 'app-aesan-sponsor-evaluation-edit-pacna',
  templateUrl: './edit-pacna.component.html',
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
export class EditPACNASponsorEvaluationComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler, OnGenericTableHandler {
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
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);
  private _notificationService = inject(NotificationService);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);
  private _siteService = inject(SiteService);
  private _siteStaffService = inject(SiteStaffService);

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
      sameAsPhysicalAddress: [false],
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
    columnsSchema: PACNA_SITES_COLUMNS_SCHEMA,
    displayedColumns: PACNA_SITES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSizeOptions: [25, 50, 100],
    pageSize: 25,
    fullScreen: false,
  };

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
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.listPrograms = resolvedData.programs;
      this.listAgencyStatus = resolvedData.agencyStatuses;
      this.listUsers = resolvedData.users;
      this.yesNoOptions = resolvedData.yesNoOptions;
      this.exceptionStatusOptions = resolvedData.exceptionStatusOptions;
      this.taxExemptionTypeOptions = resolvedData.taxExemptionTypeOptions;
      this.typeOfEntityOptions = resolvedData.typeOfEntityOptions;
      this.typeOfApplicantOptions = resolvedData.typeOfApplicantOptions;
      this.isDayCareHomeOptions = resolvedData.isDayCareHomeOptions || [];
      this.boardExecutiveAuthorityOptions = resolvedData.boardExecutiveAuthorityOptions || [];

      this.currentLang = this._translocoService.getActiveLang();

      if (resolvedData.sites) {
        const sitesData = resolvedData.sites?.data ?? [];
        this.tableConfig.dataSource.data = sitesData;
        this.tableConfig.length = resolvedData.sites.count || 0;
      }

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

    if (isNullOrUndefinedEmptyStringNullArray(param.programs)) {
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
      sameAsPhysicalAddress: false,
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
      error: () => this._notificationService.showErrorDialog(),
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
        this._customRouterService.navigate([`sponsor-evaluation/calendar/${this.param.id}`]);
        break;
      }
      default:
        break;
    }
  }

  onSubmit(): void {}
  onReject(): void {}

  onTableAdd(event?: Event, tableId?: string): void {}

  /** Abre el modal de edición del sitio. */
  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.openSiteEditModal(id);
  }

  /** Elimina un sitio (no implementado). */
  onTableDelete(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** Abre el modal de personal del sitio. */
  onTableViewStaff(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    this.openStaffBySiteModal(id);
  }

  /** Maneja acciones de la tabla. */
  onTableAction(event: Event, action: string, id: number): void {
    event.stopPropagation();
    event.preventDefault();
    if (action === 'edit') this.openSiteEditModal(id);
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

  /** Sincroniza la dirección postal con la dirección física si el checkbox está marcado. */
  onCheckboxChange(event: any): void {
    if (event.checked) {
      this.headerConfig.formGroup.patchValue({
        postalAddress: this.headerConfig.formGroup.value.address,
        postalCity: this.headerConfig.formGroup.value.city,
        postalZipCode: this.headerConfig.formGroup.value.zipCode,
      });
      if (this.headerConfig.formGroup.value.city) {
        this.getRegionsByCityId(this.headerConfig.formGroup.value.city, 'postalRegion');
      }
    } else {
      this.headerConfig.formGroup.patchValue({
        postalAddress: '',
        postalCity: '',
        postalRegion: '',
        postalZipCode: '',
      });
    }
  }

  /** Obtiene la ubicación GPS actual del navegador. */
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.headerConfig.formGroup.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => this._snackBar.open('Error al obtener la ubicación GPS', 'Cerrar', { duration: 3000 })
      );
    } else {
      this._snackBar.open('Geolocalización no soportada', 'Cerrar', { duration: 3000 });
    }
  }

  openSiteEditModal(siteId: number): void {
    this._siteService.getSiteById({ id: siteId }).subscribe({
      next: (response: any) => {
        if (response?.body) {
          const dialogRef = this._dialog.open(SiteEditModalComponent, {
            width: '90vw',
            maxWidth: '1200px',
            data: { site: response.body, agency: this.param } as SiteEditModalData,
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) this.refreshSitesTable();
          });
        }
      },
      error: () => this._notificationService.showError('Error al cargar el sitio'),
    });
  }

  openStaffBySiteModal(siteId: number): void {
    this._siteStaffService.getStaffBySite({ siteId }).subscribe({
      next: (response: any) => {
        const staffList = response?.body?.data || response?.body;
        if (staffList != null) {
          import('../staff-by-site-modal/staff-by-site-modal.component').then((module) => {
            this._dialog.open(module.StaffBySiteModalComponent, {
              width: '90vw',
              maxWidth: '1200px',
              data: { siteId, staffList },
            });
          });
        }
      },
      error: () => this._notificationService.showError('Error al cargar el personal del sitio'),
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones privadas
  // -----------------------------------------------------------------------------------------------------
  /** Recarga la tabla de sitios después de una modificación. */
  private refreshSitesTable(): void {
    this._siteService.getAllSitesFromDb({ agencyId: this.param?.id || this._authService.getAgencyId() }).subscribe({
      next: (response: any) => {
        if (response?.body) {
          const sitesData = response.body.data || response.body;
          const sitesWithSchoolName = Array.isArray(sitesData)
            ? sitesData.map((site: any) => ({ ...site, schoolName: site.school?.name || site.schoolName || '-' }))
            : sitesData;
          this.tableConfig.dataSource.data = sitesWithSchoolName;
          this.tableConfig.length = response.body.count || (Array.isArray(sitesData) ? sitesData.length : 0);
          this._changeDetectorRef.detectChanges();
        }
      },
    });
  }
}
