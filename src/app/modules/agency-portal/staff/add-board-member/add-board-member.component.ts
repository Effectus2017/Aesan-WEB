import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { StaffService } from 'app/shared/services/staff.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { NgForOf, NgIf } from '@angular/common';
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
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { AuthService } from 'app/core/auth/auth.service';
import { compareById, minimumAgeValidator, logFormValidationErrors } from 'app/shared/utils';
import { GeoService } from 'app/shared/services/geo.service';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffType } from 'app/shared/models/StaffType';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';

@Component({
  selector: 'app-add-board-member',
  templateUrl: './add-board-member.component.html',
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
    PuertoRicoZipCodeDirective,
    NumericOnlyDirective
  ],
})
export class AddBoardMemberComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _authService = inject(AuthService);
  private _geoService = inject(GeoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _staffTypeService = inject(StaffTypeService);
  private _activatedRoute = inject(ActivatedRoute);
  private _userService = inject(UserService);

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

  // Lista de títulos de miembros de junta
  listBoardMemberTitles: OptionSelection[] = [];
  // Listas para campos de Miembros de la Junta
  listTenureDurationUnits: OptionSelection[] = [];
  listReceivesProgramSalary: OptionSelection[] = [];
  listSalaryOrigins: OptionSelection[] = [];

  // Lista completa de opciones de selección
  allOptionSelections: OptionSelection[] = [];

  // Tipo de staff fijo (siempre será miembro de junta)
  private boardMemberStaffType: StaffType | null = null;

  headerConfig: GenericHeaderConfig = {
    title: 'staff.add.title',
    formGroup: this._formBuilder.group({
      // Nombre
      firstName: new FormControl('', [Validators.required]),
      // Middle name
      middleName: new FormControl(''),
      // Apellido Paterno
      fatherLastName: new FormControl('', [Validators.required]),
      // Apellido Materno
      motherLastName: new FormControl(''),
      // Status
      status: new FormControl(''),
      // Cargo
      position: new FormControl('', [Validators.required]),
      // Tipo de Staff (fijo, no visible en el formulario)
      staffType: new FormControl('', [Validators.required]),
      // Fecha de nacimiento
      birthDate: new FormControl('', [Validators.required, minimumAgeValidator(18)]),
      // Email
      email: new FormControl('', [Validators.required, Validators.email], [emailExistsValidator(this._userService)]),
      // Dirección postal
      postalAddress: new FormControl('', [Validators.required]),
      // Ciudad
      city: new FormControl('', [Validators.required]),
      // Región
      region: new FormControl('', [Validators.required]),
      // Código postal
      zipCode: new FormControl('', [Validators.required, puertoRicoZipCodeValidator()]),
      // Comentarios
      comments: new FormControl(''),
      // Sitio asignado - COMENTADO: Ya no es necesario para miembros de la junta
      // site: new FormControl('', [Validators.required]),
      // isPrimary: new FormControl(false),
      // Campos específicos para Miembros de la Junta
      tenureDuration: new FormControl('', [Validators.required]),
      tenureDurationUnit: new FormControl('', [Validators.required]),
      receivesProgramSalary: new FormControl('', [Validators.required]),
      salaryOrigins: new FormControl([] as OptionSelection[], [Validators.required]),
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'staff.add.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'staff.add.buttons.save',
    submitDisabled: true, // Inicialmente deshabilitado hasta que el formulario sea válido
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
    return this._translocoService.translate('staff.add.comments.boardMember.label');
  }

  ngOnInit(): void {
    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Obtener datos del resolver
    const resolvedData = this._activatedRoute.snapshot.data['data'];
    if (resolvedData) {
      // Cargar opciones desde el resolver
      this.allOptionSelections = resolvedData.options;
      // Status
      this.listStatus = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'isActive');
      // Posiciones de miembros de junta
      this.listBoardMemberTitles = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'boardMemberTitle');
      this.listPositions = this.listBoardMemberTitles;
      // Listas para campos de Miembros de la Junta
      this.listTenureDurationUnits = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'tenureDurationUnit');
      this.listReceivesProgramSalary = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'yesNo');
      this.listSalaryOrigins = this.allOptionSelections.filter((option: OptionSelection) => option.optionKey === 'salaryOrigin');

      // Cargar datos desde el resolver
      this.listStaffTypes = resolvedData.staffTypes;
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;

      // Asignar tipo de staff "Miembro de la Junta" (ID: 2) - este componente es únicamente para miembros de junta
      this.boardMemberStaffType = this.listStaffTypes.find(staffType => staffType.id === 2);

      if (this.boardMemberStaffType) {
        this.headerConfig.formGroup.patchValue({
          staffType: this.boardMemberStaffType
        });

        // Actualizar validaciones
        this.updateValidations();
      }

      this._changeDetectorRef.detectChanges();
    }

    // Suscribirse a cambios en la fecha de nacimiento para limpiar errores de validación
    this.headerConfig.formGroup.get('birthDate')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((birthDate: any) => {
      this.onBirthDateChange(birthDate);
    });

    // Actualizar estado del botón guardar según validez del formulario
    this.headerConfig.formGroup.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.headerConfig.submitDisabled = this.headerConfig.formGroup!.invalid;
      this._changeDetectorRef.detectChanges();
    });
    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Muestra el mensaje de éxito después de crear el staff
   */
  private showSuccessMessage(): void {
    this._notificationService.showSuccessDialogWithCallback(
      this._translocoService.translate('staff.add.success.boardMember'),
      (result) => {
        if (result === 'confirmed') {
          this._customRouterService.navigate(['staff/board-members']);
        }
      }
    );
  }

  onSubmit(): void {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      logFormValidationErrors(this.headerConfig.formGroup, 'Formulario de Personal');
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.incompleteFields'));
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

    // Status - establecer por defecto a 1 (Activo)
    const statusId: number = formValues.status?.id || 1;

    // Cargo
    const positionId: number = formValues.position?.id || 0;

    // Tipo de Staff
    const staffTypeId: number = this.boardMemberStaffType?.id || 0;

    // Comentarios
    const comments: string = formValues.comments || '';

    // Nombre
    const firstName: string = formValues.firstName || '';

    // Middle name
    const middleName: string = formValues.middleName || '';

    // Apellido Paterno
    const fatherLastName: string = formValues.fatherLastName || '';

    // Apellido Materno
    const motherLastName: string = formValues.motherLastName || '';

    // Sitio asignado - COMENTADO: Ya no es necesario para miembros de la junta
    // const siteId: number = formValues.site?.id || null;
    // const isPrimary: boolean = formValues.isPrimary || false;
    const siteId: number = null; // COMENTADO: Ya no es necesario para miembros de la junta
    const isPrimary: boolean = false; // COMENTADO: Ya no es necesario para miembros de la junta

    // Loading
    this.isLoading = true;

    // Validación: email, dirección postal, ciudad, región, código postal son requeridos
    if (!email || !postalAddress || !cityId || !regionId || !zipCode) {
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.contactLocationRequired'));
      this.isLoading = false;
      return;
    }

    // Validar campos específicos de miembros de junta
    const tenureDuration = formValues.tenureDuration;
    const tenureDurationUnit = formValues.tenureDurationUnit;
    const receivesProgramSalary = formValues.receivesProgramSalary;
    if (!tenureDuration || !tenureDurationUnit || !receivesProgramSalary) {
      this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.incompleteFields'));
      this.isLoading = false;
      return;
    }

    // Crear staff request para miembros de junta
    const staffRequest: any = {
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
      salaryOrigins: formValues.salaryOrigins ?? [],
    };

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Crear staff
    let isSuccess = false;
    this._staffService.insertStaff(staffRequest, {}).subscribe({
      next: (response) => {
        switch (response.body) {
          case true:
            isSuccess = true;
            this.clearValidationErrors();
            this.showSuccessMessage();
            break;
          default:
            this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.general'));
            this.headerConfig.formGroup.enable();
            break;
        }
      },
      error: (err) => {
        this._notificationService.showErrorDialog(this._translocoService.translate('staff.add.error.general'));
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        if (!isSuccess) {
          this.headerConfig.formGroup.enable();
        }
      },
    });
  }

  onCancel(): void {
    this._customRouterService.navigate(['staff/board-members']);
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
   * Maneja el cambio en la fecha de nacimiento para limpiar errores de validación
   */
  onBirthDateChange(birthDate: any): void {
    if (!birthDate) {
      return;
    }

    const birthDateControl = this.headerConfig.formGroup.get('birthDate');
    if (!birthDateControl) {
      return;
    }

    // Limpiar inmediatamente cualquier error de validación anterior
    birthDateControl.markAsUntouched();
    birthDateControl.markAsPristine();

    // Forzar revalidación del campo para aplicar las nuevas validaciones
    birthDateControl.updateValueAndValidity({ emitEvent: false });

    // Si después de la revalidación no hay errores, asegurar que el estado esté limpio
    if (!birthDateControl.errors) {
      birthDateControl.markAsUntouched();
      birthDateControl.markAsPristine();
    }
  }

  /**
   * Limpia los errores de validación sin cambiar los valores del formulario
   */
  private clearValidationErrors(): void {
    Object.keys(this.headerConfig.formGroup.controls).forEach(key => {
      const control = this.headerConfig.formGroup.get(key);
      if (control) {
        control.markAsUntouched();
        control.markAsPristine();
      }
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

    // Limpiar el estado de validación del campo birthDate antes de aplicar nuevas validaciones
    birthDateControl?.markAsUntouched();
    birthDateControl?.markAsPristine();
    birthDateControl?.setErrors(null);

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

    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this._changeDetectorRef.detectChanges();
  }
}

