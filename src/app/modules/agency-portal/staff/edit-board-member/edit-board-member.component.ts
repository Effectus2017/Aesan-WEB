import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { NgIf, NgForOf } from '@angular/common';
import { GenericTableConfig } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { STAFF_RELATIONSHIPS_COLUMNS_SCHEMA } from './columns-schema';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { compareById, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator, logFormValidationErrors } from 'app/shared/utils';
import { AuthService } from 'app/core/auth/auth.service';
import { GeoService } from 'app/shared/services/geo.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffType } from 'app/shared/models/StaffType';
import { Staff } from 'app/shared/models/Staff';
import { StaffRelationshipService } from 'app/shared/services/staff-relationship.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddRelationshipModalComponent } from '../add-relationship-modal/add-relationship-modal.component';
import { EditRelationshipModalComponent } from '../edit-relationship-modal/edit-relationship-modal.component';
import { StaffStatusModalComponent, StaffStatusModalData } from '../staff-status-modal/staff-status-modal.component';
import { FieldVisibilityService } from '../../../../shared/services/field-visibility.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { SiteService } from 'app/shared/services/site.service';
import { SiteStaffService } from 'app/shared/services/site-staff.service';
import { Site } from 'app/shared/models/Site';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';

@Component({
  selector: 'app-edit-board-member',
  templateUrl: './edit-board-member.component.html',
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    GenericHeaderComponent,
    NgIf,
    NgForOf,
    TranslocoModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatIconModule,
    MatTimepickerModule,
    GenericTableComponent,
    MatDialogModule,
    PuertoRicoZipCodeDirective,
    NumericOnlyDirective,
  ],
})
export class EditBoardMemberComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _authService = inject(AuthService);
  private _translocoService = inject(TranslocoService);
  private _geoService = inject(GeoService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _staffTypeService = inject(StaffTypeService);
  private _staffRelationshipService = inject(StaffRelationshipService);
  private _matDialog = inject(MatDialog);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  public fieldVisibilityService = inject(FieldVisibilityService);
  private _siteService = inject(SiteService);
  private _siteStaffService = inject(SiteStaffService);
  private _activatedRoute = inject(ActivatedRoute);
  private _userService = inject(UserService);

  // Email original para excluir de la validación en edición
  originalEmail: string = '';

  // Lista de Status
  listStatus: OptionSelection[] = [];
  // Lista de Posiciones
  listPositions: OptionSelection[] = [];
  // Lista de Tipos de Staff
  listStaffTypes: StaffType[] = [];
  // Lista de Ciudades
  listCities: City[] = [];
  // Lista de Regiones
  listRegions: Region[] = [];
  // Lista de Sitios - COMENTADO: Ya no es necesario para miembros de la junta
  // listSites: Site[] = [];

  // Lista completa de opciones de selección
  listBoardMemberTitles: OptionSelection[] = [];
  // Listas para campos de Miembros de la Junta
  listTenureDurationUnits: OptionSelection[] = [];
  listReceivesProgramSalary: OptionSelection[] = [];

  // ViewChild para el contenedor del formulario
  @ViewChild('formContainer', { static: false }) formContainer!: ElementRef;

  // Tipo de staff actual para control de visibilidad de campos
  currentStaffType: string = 'board-member';

  // Lista completa de opciones de selección
  allOptionSelections: OptionSelection[] = [];

  // Parámetro del staff
  param: Staff | null = null;

  // Configuración de la tabla de relaciones
  relationshipsTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<any>(),
    dataSourceList: [],
    columnsSchema: STAFF_RELATIONSHIPS_COLUMNS_SCHEMA,
    displayedColumns: STAFF_RELATIONSHIPS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 25,
    pageSizeOptions: [25, 50, 100],
    length: 0,
    addMenuShow: true,
    addMenuItems: [
      {
        id: 'add',
        label: 'staff.edit.relationships.add',
      },
    ],
  };

  headerConfig: GenericHeaderConfig = {
    title: 'staff.edit.title',
    formGroup: this._formBuilder.group({
      id: new FormControl(''),
      // First name
      firstName: new FormControl('', [Validators.required]),
      // Middle name
      middleName: new FormControl(''),
      // Father last name
      fatherLastName: new FormControl('', [Validators.required]),
      // Mother last name
      motherLastName: new FormControl(''),
      // Status
      status: new FormControl(''),
      // Position
      position: new FormControl('', [Validators.required]),
      // Staff type
      staffType: new FormControl('', [Validators.required]),
      // Birth date
      birthDate: new FormControl('', [Validators.required, minimumAgeValidator(18)]),
      // Email
      email: new FormControl('', [Validators.required, Validators.email], [emailExistsValidator(this._userService, this.originalEmail)]),
      // Postal address
      postalAddress: new FormControl('', [Validators.required]),
      // City
      city: new FormControl('', [Validators.required]),
      // Region
      region: new FormControl('', [Validators.required]),
      // Zip code
      zipCode: new FormControl('', [Validators.required, puertoRicoZipCodeValidator()]),
      // Comments
      comments: new FormControl(''),
      // Sitio asignado - COMENTADO: Ya no es necesario para miembros de la junta
      // site: new FormControl(null),
      // isPrimary: new FormControl(false),
      // Campos específicos para Miembros de la Junta
      tenureDuration: new FormControl(''),
      tenureDurationUnit: new FormControl(''),
      receivesProgramSalary: new FormControl(''),
    }),
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'staff.edit.submitButton',
    submitDisabled: true, // Inicialmente deshabilitado
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'staff.edit.cancelButton',
    // Settings button
    settingsButtonShow: true,
    settingsButtonTooltip: 'staff.edit.settings.tooltip',
    settingsMenuItems: [
      {
        id: 'toggle-active',
        label: 'staff.edit.settings.toggle-active',
        icon: 'heroicons_outline:power'
      }
    ],
  };

  // Compare methods
  compareById = compareById;

  // Agencia Id
  agencyId: number = 0;

  // Loading
  isLoading: boolean = false;

  // Lenguaje actual
  currentLang: string = 'es';

  /**
   * Obtiene el label correcto para el campo de comentarios para miembros de junta
   */
  get commentsLabel(): string {
    return this._translocoService.translate('staff.edit.comments.boardMember.label');
  }


  ngOnInit(): void {
    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Establecer la configuración activa para este formulario
    this.fieldVisibilityService.setActiveConfig('staff');

    // Establecer tipo de staff como miembro de junta
    this.currentStaffType = 'board-member';

    // Establecer valores por defecto para el usuario actual
    const userRole = this._authService.getUserRole();
    const userPermissions = this._authService.getUserPermissions() || [];

    if (userRole) {
      this.fieldVisibilityService.setCurrentUser(userRole, userPermissions);
    }

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Obtener datos del resolver
    const resolvedData = this._activatedRoute.snapshot.data['data'];
    if (resolvedData) {
      // Cargar opciones desde el resolver
      this.allOptionSelections = resolvedData.options.data;
      // Status
      this.listStatus = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'isActive');
      // Posiciones de miembros de junta
      this.listBoardMemberTitles = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'boardMemberTitle');
      this.listPositions = this.listBoardMemberTitles;
      // Listas para campos de Miembros de la Junta
      this.listTenureDurationUnits = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'tenureDurationUnit');
      this.listReceivesProgramSalary = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'yesNo');

      // Cargar datos desde el resolver
      this.listStaffTypes = resolvedData.staffTypes;
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;

      // Cargar relaciones desde el resolver
      this.relationshipsTableConfig.dataSource.data = resolvedData.relationships;
      this.relationshipsTableConfig.length = resolvedData.relationships?.length || 0;

      // Cargar staff desde el resolver
      this.param = resolvedData.staff;
      this.onSetForm(resolvedData.staff);
    }

    // Staff Types - Mantener suscripción como fallback si no hay datos del resolver
    this._staffTypeService.staffTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result) && !this.listStaffTypes.length) {
        this.listStaffTypes = result.body;
      }
    });

    // Cities - Mantener suscripción como fallback si no hay datos del resolver
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body) && !this.listCities.length) {
        this.listCities = result.body;
      }
    });

    // Regions - Mantener suscripción como fallback si no hay datos del resolver
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body) && !this.listRegions.length) {
        this.listRegions = result.body;
      }
    });

    // Subscribierse a obtener relaciones (para actualizaciones después de agregar/editar)
    this._staffRelationshipService.relationships$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.relationshipsTableConfig.dataSource.data = result.body;
        this.relationshipsTableConfig.length = result.body.length;
      }
    });

    // Subscribierse a obtener staff (para actualizaciones después de cambios)
    this._staffService.staff$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.onSetForm(result.body);
      }
    });

    // Suscribirse a cambios de validación del formulario para actualizar el estado del botón de guardar
    this.headerConfig.formGroup.statusChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
        this._changeDetectorRef.detectChanges();
      });

    // Suscribirse a cambios en los valores del formulario para actualizar el botón dinámicamente
    this.headerConfig.formGroup.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
      });

    // Establecer el estado inicial del botón
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;

    // Única llamada a detectChanges al final de ngOnInit
    this._changeDetectorRef.detectChanges();

    // Reset completo de scroll
    this.resetAllScrolls();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Staff): void {
    this.param = param;

    // Guardar el email original para excluirlo de la validación
    this.originalEmail = param.email || '';

    const staffType = this.listStaffTypes.find((st) => st.id === param.staffType?.id);

    // Para miembros de junta, usar la lista específica
    this.listPositions = this.listBoardMemberTitles;

    // Buscar los objetos correctos de las listas usando los IDs
    const cityId = param.city?.id || param.cityId;
    const regionId = param.region?.id || param.regionId;
    const foundCity = cityId ? this.listCities.find(c => c.id === cityId) : null;
    const foundRegion = regionId ? this.listRegions.find(r => r.id === regionId) : null;

    // Si se encontró la ciudad pero no la región, cargar las regiones de esa ciudad
    if (foundCity && !foundRegion && cityId) {
      const queryParameters: QueryParameters = {
        cityId: cityId,
      };
      this._geoService.getRegionsByCityId(queryParameters).subscribe({
        next: (response) => {
          if (response?.body?.data) {
            this.listRegions = response.body.data;
            const finalRegion = this.listRegions.find(r => r.id === regionId);
            this.setFormValues(param, foundCity, finalRegion);
          } else {
            this.setFormValues(param, foundCity, null);
          }
        },
        error: (error) => {
          console.error('Error al cargar las regiones:', error);
          this.setFormValues(param, foundCity, null);
        }
      });
    } else {
      this.setFormValues(param, foundCity, foundRegion);
    }
  }

  private setFormValues(param: Staff, city: City | null, region: Region | null): void {
    // Buscar otros objetos de las listas usando los IDs
    const position = param.position?.id && this.listPositions.length > 0
      ? this.listPositions.find(p => p.id === param.position.id)
      : param.position;

    const status = param.status?.id
      ? this.listStatus.find(s => s.id === param.status.id)
      : param.status;

    // Establecer valores del formulario
    this.headerConfig.formGroup.patchValue({
      id: param.id,
      firstName: param.firstName,
      middleName: param.middleName,
      fatherLastName: param.fatherLastName,
      motherLastName: param.motherLastName,
      status: status,
      position: position,
      staffType: param.staffType,
      birthDate: param.birthDate,
      email: param.email,
      postalAddress: param.postalAddress,
      city: city,
      region: region,
      zipCode: param.zipCode,
      comments: param.comments,
      // site: param.site, // COMENTADO: Ya no es necesario para miembros de la junta
      // isPrimary: param.isPrimary, // COMENTADO: Ya no es necesario para miembros de la junta
      tenureDuration: param.tenureDuration,
      tenureDurationUnit: param.tenureDurationUnitId ? this.listTenureDurationUnits.find(u => u.id === param.tenureDurationUnitId) : null,
      receivesProgramSalary: param.receivesProgramSalaryId ? this.listReceivesProgramSalary.find(s => s.id === param.receivesProgramSalaryId) : null,
    });

    // Actualizar el validador de email con el email original
    const emailControl = this.headerConfig.formGroup.get('email');
    if (emailControl) {
      emailControl.clearAsyncValidators();
      emailControl.setAsyncValidators([emailExistsValidator(this._userService, this.originalEmail)]);
      emailControl.updateValueAndValidity();
    }

    // Actualizar validaciones
    this.updateValidations();

    // 🔒 DESHABILITAR EL CONTROL staffType DEL FORMULARIO DESPUÉS de establecer el valor
    this.headerConfig.formGroup.get('staffType')?.disable();

    // Actualizar el estado inicial del botón de submit
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;

    // Cargar sitio actualmente asignado al staff - COMENTADO: Ya no es necesario para miembros de la junta
    // this.loadCurrentSiteAssignment(param.id);

    // Cargar relaciones
    this.loadStaffRelationships();
  }

  /**
   * Carga el sitio actualmente asignado al staff
   * COMENTADO: Ya no es necesario para miembros de la junta
   */
  // private loadCurrentSiteAssignment(staffId: number): void {
  //   this._siteStaffService.getSitesByStaff({ staffId }).subscribe({
  //     next: (siteStaffs) => {
  //       if (siteStaffs && siteStaffs.length > 0) {
  //         const activeAssignment = siteStaffs.find((assignment: any) => assignment.isActive);
  //         if (activeAssignment) {
  //           this.headerConfig.formGroup.patchValue({
  //             site: { id: activeAssignment.siteId, name: activeAssignment.siteName },
  //             isPrimary: activeAssignment.isPrimary || false,
  //           });
  //         }
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error loading site assignment:', err);
  //     },
  //   });
  // }

  /**
   * Muestra el mensaje de éxito después de actualizar el staff
   */
  private showEditSuccessMessage(): void {
    this._notificationService.showSuccessDialogWithCallback(this._translocoService.translate('staff.edit.success.boardMember'), (result) => {
      if (result === 'confirmed') {
        this._customRouterService.navigate(['staff/board-members']);
      }
    });
  }

  onSubmit(): void {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Personal');
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.edit.error.incompleteFields'));
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.value;

    // Fecha de nacimiento
    const birthDate: string = formValues.birthDate || null;

    // Email
    const email: string = formValues.email || '';

    // Dirección postal
    const postalAddress: string = formValues.postalAddress || '';

    // Código postal
    const zipCode: string = formValues.zipCode || '';

    // Ciudad
    const cityId: number = formValues.city?.id || 0;

    // Región
    const regionId: number = formValues.region?.id || 0;

    // Status
    const statusId: number = formValues.status?.id || this.param?.statusId || 1;

    // Cargo
    const positionId: number = formValues.position?.id || 0;

    // Tipo de Staff
    const staffTypeId: number = formValues.staffType?.id || this.param?.staffType?.id || 0;

    // Comentarios
    const comments: string = formValues.comments || '';

    // Nombres
    const firstName: string = formValues.firstName || '';
    const middleName: string = formValues.middleName || '';
    const fatherLastName: string = formValues.fatherLastName || '';
    const motherLastName: string = formValues.motherLastName || '';

    // Sitio asignado - COMENTADO: Ya no es necesario para miembros de la junta
    // const siteId: number = formValues.site?.id || null;
    // const isPrimary: boolean = formValues.isPrimary || false;
    const siteId: number = null; // COMENTADO: Ya no es necesario para miembros de la junta
    const isPrimary: boolean = false; // COMENTADO: Ya no es necesario para miembros de la junta

    // Loading
    this.isLoading = true;

    // Validación: email, dirección postal, ciudad, región, código de área son requeridos
    if (!email || !postalAddress || !cityId || !regionId || !zipCode) {
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.edit.error.contactLocationRequired'));
      this.isLoading = false;
      return;
    }

    // Validación: campos específicos de miembros de junta son requeridos
    const tenureDuration = formValues.tenureDuration;
    const tenureDurationUnit = formValues.tenureDurationUnit;
    const receivesProgramSalary = formValues.receivesProgramSalary;
    if (!tenureDuration || !tenureDurationUnit || !receivesProgramSalary) {
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.edit.error.incompleteFields'));
      this.isLoading = false;
      return;
    }

    // Validar que staffTypeId sea válido
    if (!staffTypeId) {
      this._notificationService.showErrorDialog('El tipo de personal es requerido y no puede ser 0.');
      this.isLoading = false;
      return;
    }

    // Crear staff request para miembros de junta
    const staffRequest: any = {
      id: formValues.id,
      statusId: statusId,
      positionId: positionId,
      staffTypeId: staffTypeId,
      comments: comments,
      isActive: true,
      agencyId: this.agencyId,
      firstName: firstName,
      middleName: middleName,
      fatherLastName: fatherLastName,
      motherLastName: motherLastName,
      siteId: siteId,
      isPrimary: isPrimary,
      birthDate: birthDate,
      email: email,
      postalAddress: postalAddress,
      cityId: cityId,
      regionId: regionId,
      zipCode: zipCode,
      tenureDuration: tenureDuration ? parseInt(tenureDuration) : null,
      tenureDurationUnitId: tenureDurationUnit?.id || null,
      receivesProgramSalaryId: receivesProgramSalary?.id || null,
    };

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Actualizar staff
    this._staffService.updateStaff(staffRequest, {}).subscribe({
      next: (response) => {
        switch (response.body) {
          case true:
            this.showEditSuccessMessage();
            break;
          default:
            this._notificationService.showErrorDialog('staff.edit.error.general');
            break;
        }
      },
      error: () => {
        this._notificationService.showErrorDialog('staff.edit.error.general');
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        this.headerConfig.formGroup.enable();
        this.headerConfig.formGroup.get('staffType')?.disable();
      },
    });
  }

  onCancel(): void {
    this._customRouterService.navigate(['staff/board-members']);
  }

  // Método para manejar acciones del menú de settings
  onSettingsMenuAction(menuItemId: string): void {
    switch (menuItemId) {
      case 'toggle-active':
        this.onToggleActive();
        break;
      default:
        console.warn(`Acción de menú no reconocida: ${menuItemId}`);
    }
  }

  // Método para activar/desactivar
  private onToggleActive(): void {
    if (!this.param?.id) {
      console.error('No se puede cambiar el estado: ID de staff no disponible');
      return;
    }

    const currentIsActive = this.param.isActive ?? true;

    const dialogRef = this._matDialog.open(StaffStatusModalComponent, {
      data: {
        staffId: this.param.id,
        isActive: currentIsActive,
        isActiveOptions: this.listStatus
      } as StaffStatusModalData,
      disableClose: false,
      width: '600px',
      maxWidth: '90vw',
      panelClass: ['mat-dialog-container', 'dialog-responsive']
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'submit') {
        this.reloadStaffData();
      }
    });
  }

  // Método para recargar los datos del staff después de cambiar el estado
  private reloadStaffData(): void {
    if (!this.param?.id) {
      return;
    }

    const requestParameters: QueryParameters = {
      id: this.param.id,
      isList: false,
      isActive: false,
    };

    this._staffService.getStaffById(requestParameters).subscribe({
      next: (response: any) => {
        if (response?.body) {
          this.param = response.body;
          this.onSetForm(response.body);
          this._changeDetectorRef.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al recargar los datos del staff:', error);
      }
    });
  }

  /**
   * Obtiene todas las regiones según el ID de la ciudad
   */
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
                // Asignar automáticamente la única región encontrada
                this.headerConfig.formGroup.patchValue({ region: this.listRegions[0] });
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

  /**
   * Actualiza las validaciones para miembros de junta
   */
  updateValidations(): void {
    const birthDateControl = this.headerConfig.formGroup.get('birthDate');
    const firstNameControl = this.headerConfig.formGroup.get('firstName');
    const fatherLastNameControl = this.headerConfig.formGroup.get('fatherLastName');
    const emailControl = this.headerConfig.formGroup.get('email');
    const cityControl = this.headerConfig.formGroup.get('city');
    const regionControl = this.headerConfig.formGroup.get('region');
    const zipCodeControl = this.headerConfig.formGroup.get('zipCode');
    const postalAddressControl = this.headerConfig.formGroup.get('postalAddress');
    const positionControl = this.headerConfig.formGroup.get('position');
    const tenureDurationControl = this.headerConfig.formGroup.get('tenureDuration');
    const tenureDurationUnitControl = this.headerConfig.formGroup.get('tenureDurationUnit');
    const receivesProgramSalaryControl = this.headerConfig.formGroup.get('receivesProgramSalary');

    // Para miembros de junta: fecha de nacimiento requerida (mínimo 18 años)
    birthDateControl?.setValidators([Validators.required, minimumAgeValidator(18)]);
    firstNameControl?.setValidators([Validators.required]);
    fatherLastNameControl?.setValidators([Validators.required]);
    emailControl?.setValidators([Validators.required, Validators.email]);
    cityControl?.setValidators([Validators.required]);
    regionControl?.setValidators([Validators.required]);
    zipCodeControl?.setValidators([Validators.required, puertoRicoZipCodeValidator()]);
    postalAddressControl?.setValidators([Validators.required]);
    positionControl?.setValidators([Validators.required]);
    // Campos específicos para miembros de junta son requeridos
    tenureDurationControl?.setValidators([Validators.required]);
    tenureDurationUnitControl?.setValidators([Validators.required]);
    receivesProgramSalaryControl?.setValidators([Validators.required]);

    birthDateControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    fatherLastNameControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();
    cityControl?.updateValueAndValidity();
    regionControl?.updateValueAndValidity();
    zipCodeControl?.updateValueAndValidity();
    postalAddressControl?.updateValueAndValidity();
    positionControl?.updateValueAndValidity();
    tenureDurationControl?.updateValueAndValidity();
    tenureDurationUnitControl?.updateValueAndValidity();
    receivesProgramSalaryControl?.updateValueAndValidity();

    // Habilitar todos los campos para miembros de junta
    firstNameControl?.enable({ emitEvent: false });
    fatherLastNameControl?.enable({ emitEvent: false });
    positionControl?.enable({ emitEvent: false });
    birthDateControl?.enable({ emitEvent: false });
    emailControl?.enable({ emitEvent: false });
    cityControl?.enable({ emitEvent: false });
    regionControl?.enable({ emitEvent: false });
      zipCodeControl?.enable({ emitEvent: false });
    postalAddressControl?.enable({ emitEvent: false });
    tenureDurationControl?.enable({ emitEvent: false });
    tenureDurationUnitControl?.enable({ emitEvent: false });
    receivesProgramSalaryControl?.enable({ emitEvent: false });

    // Actualizar el estado del botón después de cambiar las validaciones
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Abre el modal para agregar una nueva relación
   */
  onAddRelationship(): void {
    const dialogRef = this._matDialog.open(AddRelationshipModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        currentStaffId: this.headerConfig.formGroup.get('id')?.value,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStaffRelationships();
      }
    });
  }

  /**
   * Método requerido por GenericTable para el botón de agregar
   */
  onAdd(): void {
    this.onAddRelationship();
  }

  /**
   * Método requerido por GenericTable para el botón de agregar (interfaz OnGenericTableHandler)
   */
  onAddButtonClick(): void {
    this.onAddRelationship();
  }

  /**
   * Maneja las acciones del menú de agregar
   */
  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.onAddRelationship();
    }
  }

  onTableEdit(event: Event, id: number): void {
    event.stopPropagation();
    event.preventDefault();

    // Buscar la relación por ID
    const relationship = this.relationshipsTableConfig.dataSource.data.find((rel: any) => rel.id === id);

    if (relationship) {
      // Abrir modal de edición
      const dialogRef = this._matDialog.open(EditRelationshipModalComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          currentStaffId: this.headerConfig.formGroup.get('id')?.value,
          relationship: relationship,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // Recargar las relaciones si se actualizó correctamente
          this.loadStaffRelationships();
        }
      });
    }
  }

  /**
   * Elimina una relación
   */
  onTableDeleteElement(event: Event, element?: any): void {
    event.stopPropagation();
    event.preventDefault();

    if (!element) {
      return;
    }

    // Mostrar confirmación antes de eliminar
    const dialogRef = this._fuseConfirmationService.open({
      title: 'Confirmar eliminación',
      message: '¿Está seguro de que desea eliminar esta relación?',
      actions: {
        confirm: {
          label: 'Eliminar',
          color: 'warn',
        },
        cancel: {
          label: 'Cancelar',
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.deleteRelationship(element.id);
      }
    });
  }

  /**
   * Elimina una relación
   */
  deleteRelationship(relationshipId: number): void {
    const queryParams: QueryParameters = {
      id: relationshipId,
    };

    this._staffRelationshipService.deactivateRelationship(queryParams).subscribe({
      next: (response) => {
        this._notificationService.showSuccess('Relación eliminada exitosamente');
        // Recargar la lista si es necesario
        this.loadStaffRelationships();
      },
      error: (error) => {
        console.error('Error deleting relationship:', error);
        this._notificationService.showError('Error al eliminar la relación');
      },
    });
  }

  loadStaffRelationships(): void {
    const requestParameters: QueryParameters = {
      id: this.headerConfig.formGroup.get('id')?.value,
      isList: false,
      isActive: false,
    };
    this._staffRelationshipService.getRelationshipsByStaffId(requestParameters).subscribe();
  }


  /**
   * Resetea todos los scrolls de la página
   */
  private resetAllScrolls(): void {
    setTimeout(() => {
      window.scrollTo(0, 0);

      if (this.formContainer?.nativeElement) {
        this.formContainer.nativeElement.scrollTop = 0;
      }

      const mainFormContainer = document.querySelector('.overflow-y-auto[cdkScrollable]');
      if (mainFormContainer) {
        mainFormContainer.scrollTop = 0;
      }

      const scrollableElements = document.querySelectorAll('[style*="overflow"], [style*="scroll"], .mat-mdc-dialog-content, .mat-mdc-card-content, .mat-mdc-tab-body-content');

      scrollableElements.forEach((element: any) => {
        if (element.scrollTop !== undefined) {
          element.scrollTop = 0;
        }
        if (element.scrollLeft !== undefined) {
          element.scrollLeft = 0;
        }
      });

      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;

      if (document.body.scrollTop !== 0) {
        document.body.scrollTop = 0;
      }
    }, 300);
  }
}

