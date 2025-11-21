import { ChangeDetectorRef, Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ReactiveFormsModule, UntypedFormBuilder, FormControl, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgIf, NgForOf } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Staff } from 'app/shared/models/Staff';
import { StaffService } from 'app/shared/services/staff.service';
import { GeoService } from 'app/shared/services/geo.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { StaffType } from 'app/shared/models/StaffType';
import { StaffClassification } from 'app/shared/models/StaffClassification';
import { Site } from 'app/shared/models/Site';
import { StaffRequest } from 'app/shared/models/Request/StaffRequest';
import { compareById, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator } from 'app/shared/utils';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { StaffTypeService } from 'app/shared/services/staff-type.service';
import { StaffClassificationService } from 'app/shared/services/staff-classification.service';
import { SiteService } from 'app/shared/services/site.service';
import { SiteStaffService } from 'app/shared/services/site-staff.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FieldVisibilityService } from 'app/shared/services/field-visibility.service';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';

export interface StaffEditModalData {
  staff: Staff;
  sites?: Site[];
}

@Component({
  selector: 'app-staff-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    TranslocoModule,
    NgIf,
    NgForOf,
    MatTooltipModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './staff-edit-modal.component.html',
})
export class StaffEditModalComponent implements OnInit, OnDestroy {
  private _formBuilder = inject(UntypedFormBuilder);
  private _staffService = inject(StaffService);
  private _geoService = inject(GeoService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _staffTypeService = inject(StaffTypeService);
  private _staffClassificationService = inject(StaffClassificationService);
  private _siteService = inject(SiteService);
  private _siteStaffService = inject(SiteStaffService);
  private _authService = inject(AuthService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  public fieldVisibilityService = inject(FieldVisibilityService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _userService = inject(UserService);

  // Form
  form = this._formBuilder.group({
    id: new FormControl(''),
    firstName: new FormControl('', [Validators.required]),
    middleName: new FormControl(''),
    fatherLastName: new FormControl('', [Validators.required]),
    motherLastName: new FormControl(''),
    status: new FormControl('', [Validators.required]),
    position: new FormControl('', [Validators.required]),
    staffType: new FormControl('', [Validators.required]),
    staffClassification: new FormControl(''),
    contractStartDate: new FormControl(''),
    contractEndDate: new FormControl(''),
    birthDate: new FormControl('', [Validators.required, minimumAgeValidator(18)]),
    email: new FormControl('', [Validators.required, Validators.email], [emailExistsValidator(this._userService, this.originalEmail)]),
    postalAddress: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    region: new FormControl('', [Validators.required]),
    areaCode: new FormControl('', [Validators.required]),
    comments: new FormControl(''),
    site: new FormControl(null),
    isPrimary: new FormControl(false),
    reviewResult: new FormControl(''),
    reviewDate: new FormControl(''),
    reviewJustification: new FormControl(''),
  });

  // Lists
  listStatus: OptionSelection[] = [];
  listPositions: OptionSelection[] = [];
  listStaffTypes: StaffType[] = [];
  listStaffClassifications: StaffClassification[] = [];
  listCities: City[] = [];
  listRegions: Region[] = [];
  listSites: Site[] = [];
  reviewResult: OptionSelection[] = [];
  listAdministrativePositions: OptionSelection[] = [];
  listOperationalPositions: OptionSelection[] = [];
  listBoardMemberTitles: OptionSelection[] = [];

  // Email original para excluir de la validación en edición
  originalEmail: string = '';

  // Type properties
  isEmployee: boolean = false;
  isBoardMember: boolean = false;
  currentStaffType: string = '';
  selectedClassification: StaffClassification | null = null;
  canViewReviewFields: boolean = false;

  currentLang: string = 'es';
  agencyId: number = 0;
  isLoading: boolean = false;

  compareById = compareById;

  constructor(
    public dialogRef: MatDialogRef<StaffEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StaffEditModalData
  ) {
    this.currentLang = this._translocoService.getActiveLang();
    this.agencyId = this._authService.getAgencyId();
  }

  ngOnInit(): void {
    // Set active config
    this.fieldVisibilityService.setActiveConfig('staff');

    // Set current user for field visibility
    const userRole = this._authService.getUserRole();
    const userPermissions = this._authService.getUserPermissions() || [];
    if (userRole) {
      this.fieldVisibilityService.setCurrentUser(userRole, userPermissions);
    }

    // Set default staff type to ensure fields show while loading
    this.currentStaffType = 'employee';

    this.checkAdminPermissions();
    this.setupForm();
    this.loadLists();
    this.loadOptionSelections();

    // Load data - use staff data from modal input directly (like original component uses resolver data)
    // Wait a bit for lists to load, then set form values
    if (this.data.staff) {
      setTimeout(() => {
        this.setFormValues(this.data.staff);
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  private setupForm(): void {
    // Listen to staffType changes
    this.form.get('staffType')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((staffType) => {
      if (staffType) {
        this.onStaffTypeChange(staffType);
      }
    });

    // Listen to staffClassification changes
    this.form.get('staffClassification')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((classification) => {
      if (classification) {
        this.onClassificationChange(classification);
      }
    });

    // Listen to city changes for regions
    this.form.get('city')?.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((city) => {
      if (city) {
        this.getRegionsByCityId(city);
      }
    });
  }

  private loadLists(): void {
    // Load cities and regions using getCitiesFromDb and getRegionsFromDb like the original component
    const requestParameters: QueryParameters = {
      take: 25,
      skip: 0,
      alls: true,
      isList: true,
    };

    // Cities
    this._geoService.getCitiesFromDb(requestParameters).subscribe();
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listCities = result.body;
      }
    });

    // Regions
    this._geoService.getRegionsFromDb(requestParameters).subscribe();
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listRegions = result.body;
      }
    });

    // Staff Types - Load using getAllStaffTypesFromDb like the original component
    this._staffTypeService.getAllStaffTypesFromDb(requestParameters).subscribe();
    this._staffTypeService.staffTypes$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffTypes = result.body;
      }
    });

    // Staff Classifications - Load using getAllStaffClassificationsFromDb like the original component
    this._staffClassificationService.getAllStaffClassificationsFromDb(requestParameters).subscribe();
    this._staffClassificationService.staffClassifications$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listStaffClassifications = result.body;
      }
    });

    // Sites
    if (this.data.sites) {
      this.listSites = this.data.sites;
    } else {
      const queryParameters: QueryParameters = {
        agencyId: this.agencyId,
      };
      this._siteService.getAllSitesFromDb(queryParameters).subscribe();
      this._siteService.sites$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
        if (!isNullOrUndefinedEmptyStringNullArray(result)) {
          this.listSites = result.body?.data || [];
        }
      });
    }
  }

  private loadOptionSelections(): void {
    // Load options using getOptionSelectionByOptionKey like the original component
    const requestParameters: QueryParameters = {
      take: 25,
      skip: 0,
      alls: true,
      isList: true,
    };

    this._optionSelectionService.getOptionSelectionByOptionKey({
      optionKey: 'administrativePosition,operationalPosition,boardMemberTitle,isActive,reviewResult',
      names: null,
    }).subscribe();

    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        const options = result.body?.data || result.body || [];
        this.listStatus = options.filter((opt: OptionSelection) => opt.optionKey === 'isActive');
        this.listAdministrativePositions = options.filter((opt: OptionSelection) => opt.optionKey === 'administrativePosition');
        this.listOperationalPositions = options.filter((opt: OptionSelection) => opt.optionKey === 'operationalPosition');
        this.listBoardMemberTitles = options.filter((opt: OptionSelection) => opt.optionKey === 'boardMemberTitle');
        this.reviewResult = options.filter((opt: OptionSelection) => opt.optionKey === 'reviewResult');
      }
    });
  }

  private checkAdminPermissions(): void {
    const userRole = this._authService.getUserRole();
    this.canViewReviewFields = userRole === 'Administrator' || userRole === 'Admin';

    if (this.canViewReviewFields) {
      this.form.get('reviewResult')?.setValidators([Validators.required]);
      this.form.get('reviewDate')?.setValidators([Validators.required]);
      this.form.get('reviewJustification')?.setValidators([Validators.required]);
    } else {
      this.form.get('reviewResult')?.clearValidators();
      this.form.get('reviewDate')?.clearValidators();
      this.form.get('reviewJustification')?.clearValidators();
    }
  }

  private setFormValues(staff: Staff): void {
    // Guardar el email original para excluirlo de la validación
    this.originalEmail = staff.email || '';

    // Find staff type from list (like original component)
    const staffType = this.listStaffTypes.find((st) => st.id === staff.staffType?.id);

    if (staffType) {
      this.isEmployee = staffType.name?.toLowerCase().includes('empleado') || staffType.nameEn?.toLowerCase().includes('employee') || staffType.id === 1;
      this.isBoardMember = staffType.name === 'Miembro de la Junta' || staffType.nameEn === 'Board Member';

      // Set current staff type for visibility service
      if (this.isEmployee) {
        this.currentStaffType = 'employee';
      } else if (this.isBoardMember) {
        this.currentStaffType = 'board-member';
      } else {
        this.currentStaffType = 'other';
      }
    }

    // Find staff classification from list to ensure correct object reference
    const staffClassification = staff.staffClassification
      ? this.listStaffClassifications.find((sc) => sc.id === staff.staffClassification?.id) || staff.staffClassification
      : null;

    // Configure initial staff type state
    if (this.isEmployee) {
      // For employees, positions will be loaded based on classification
      this.listPositions = [];
    } else {
      // For board members, use specific list
      this.listPositions = this.listBoardMemberTitles;
    }

    this.onStaffTypeChange(staffType);

    // Set form values using objects that come directly from staff (like original component)
    this.form.patchValue({
      id: staff.id,
      firstName: staff.firstName,
      middleName: staff.middleName,
      fatherLastName: staff.fatherLastName,
      motherLastName: staff.motherLastName,
      status: staff.status,
      position: staff.position,
      staffType: staffType || staff.staffType,
      staffClassification: staffClassification,
      contractStartDate: staff.contractStartDate,
      contractEndDate: staff.contractEndDate,
      birthDate: staff.birthDate,
      email: staff.email,
      postalAddress: staff.postalAddress,
      city: staff.city,
      region: staff.region,
      areaCode: staff.areaCode,
      comments: staff.comments,
      reviewDate: staff.reviewDate,
      reviewJustification: staff.reviewJustification,
      site: staff.school,
      reviewResult: staff.reviewResultId ? this.reviewResult.find((r) => r.id === staff.reviewResultId) || null : null,
    });

    // Actualizar el validador de email con el email original
    const emailControl = this.form.get('email');
    if (emailControl) {
      emailControl.clearAsyncValidators();
      emailControl.setAsyncValidators([emailExistsValidator(this._userService, this.originalEmail)]);
      emailControl.updateValueAndValidity();
    }

    // Update validations
    this.updateValidations();

    // If employee and has classification, load positions
    if (this.isEmployee && staffClassification) {
      this.selectedClassification = staffClassification;
      this.loadPositionsByClassification();
    }

    // Disable staffType after setting value
    this.form.get('staffType')?.disable();

    // Load current site assignment
    this.loadCurrentSiteAssignment(staff.id);
  }


  private loadCurrentSiteAssignment(staffId: number): void {
    const queryParameters: QueryParameters = {
      staffId: staffId,
    };
    this._siteStaffService.getSitesByStaff(queryParameters).subscribe({
      next: (siteStaffs: any) => {
        if (siteStaffs && siteStaffs.length > 0) {
          const activeAssignment = siteStaffs.find((assignment: any) => assignment.isActive);
          if (activeAssignment) {
            this.form.patchValue({
              site: { id: activeAssignment.siteId, name: activeAssignment.siteName },
              isPrimary: activeAssignment.isPrimary || false,
            });
          }
        }
      },
      error: (err) => {
        console.error('Error loading site assignment:', err);
      },
    });
  }


  onStaffTypeChange(staffType: StaffType): void {
    if (!staffType) {
      this.resetStaffTypeFields();
      return;
    }

    this.isEmployee = staffType.name === 'Empleado' || staffType.nameEn === 'Employee';
    this.isBoardMember = staffType.name === 'Miembro de la Junta' || staffType.nameEn === 'Board Member';

    if (this.isEmployee) {
      this.currentStaffType = 'employee';
    } else if (this.isBoardMember) {
      this.currentStaffType = 'board-member';
    } else {
      this.currentStaffType = 'other';
    }

    // Reset classification
    this.form.patchValue({
      staffClassification: null,
    });

    // If board member, clear contract dates
    if (this.isBoardMember) {
      this.form.patchValue({
        contractStartDate: null,
        contractEndDate: null,
      });
    }

    // Update validations
    this.updateValidations();

    // Load positions by type
    this.loadPositionsByType();

    this._changeDetectorRef.detectChanges();
  }

  onClassificationChange(classification: StaffClassification): void {
    this.selectedClassification = classification;
    this.loadPositionsByClassification();

    // If employee and has classification, enable all fields
    if (this.isEmployee && this.selectedClassification) {
      const fields = ['status', 'firstName', 'middleName', 'fatherLastName', 'motherLastName', 'position', 'contractStartDate', 'contractEndDate', 'comments', 'birthDate'];
      fields.forEach((fieldName) => {
        this.form.get(fieldName)?.enable({ emitEvent: false });
      });
    }

    this.updateValidations();
    this._changeDetectorRef.detectChanges();
  }

  loadPositionsByType(): void {
    if (this.isEmployee) {
      this.listPositions = [];
    } else if (this.isBoardMember) {
      this.listPositions = this.listBoardMemberTitles;
    }
    this._changeDetectorRef.detectChanges();
  }

  loadPositionsByClassification(): void {
    if (!this.selectedClassification) {
      if (!this.isBoardMember) {
        this.listPositions = [];
      }
      return;
    }

    if (this.selectedClassification?.name === 'Administrativo' || this.selectedClassification?.nameEn === 'Administrative') {
      this.listPositions = this.listAdministrativePositions;
    } else if (this.selectedClassification?.name === 'Operacional' || this.selectedClassification?.nameEn === 'Operational') {
      this.listPositions = this.listOperationalPositions;
    } else {
      this.listPositions = [];
    }
    this._changeDetectorRef.detectChanges();
  }

  private resetStaffTypeFields(): void {
    this.isEmployee = false;
    this.isBoardMember = false;
    this.selectedClassification = null;

    this.form.patchValue({
      staffClassification: null,
      contractStartDate: null,
      contractEndDate: null,
    });

    this.updateValidations();
  }

  private updateValidations(): void {
    const staffClassificationControl = this.form.get('staffClassification');
    const birthDateControl = this.form.get('birthDate');
    const firstNameControl = this.form.get('firstName');
    const fatherLastNameControl = this.form.get('fatherLastName');
    const emailControl = this.form.get('email');
    const cityControl = this.form.get('city');
    const regionControl = this.form.get('region');
    const areaCodeControl = this.form.get('areaCode');
    const postalAddressControl = this.form.get('postalAddress');

    if (this.isEmployee) {
      staffClassificationControl?.setValidators([Validators.required]);
      birthDateControl?.setValidators([Validators.required]);
      firstNameControl?.setValidators([Validators.required]);
      fatherLastNameControl?.setValidators([Validators.required]);
      emailControl?.clearValidators();
      cityControl?.clearValidators();
      regionControl?.clearValidators();
      areaCodeControl?.clearValidators();
      postalAddressControl?.clearValidators();
    } else if (this.isBoardMember) {
      staffClassificationControl?.clearValidators();
      birthDateControl?.setValidators([Validators.required, minimumAgeValidator(18)]);
      firstNameControl?.setValidators([Validators.required]);
      fatherLastNameControl?.setValidators([Validators.required]);
      emailControl?.setValidators([Validators.required, Validators.email]);
      cityControl?.setValidators([Validators.required]);
      regionControl?.setValidators([Validators.required]);
      areaCodeControl?.setValidators([Validators.required]);
      postalAddressControl?.setValidators([Validators.required]);
    }

    staffClassificationControl?.updateValueAndValidity();
    birthDateControl?.updateValueAndValidity();
    firstNameControl?.updateValueAndValidity();
    fatherLastNameControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();
    cityControl?.updateValueAndValidity();
    regionControl?.updateValueAndValidity();
    areaCodeControl?.updateValueAndValidity();
    postalAddressControl?.updateValueAndValidity();
  }

  getRegionsByCityId(city: City): void {
    if (city?.id) {
      const queryParameters: QueryParameters = {
        cityId: city.id,
        isList: true,
      };
      this._geoService.getRegionsByCityId(queryParameters).subscribe({
        next: (result: any) => {
          if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
            this.listRegions = result.body;
            this._changeDetectorRef.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error loading regions:', error);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    if (this.form.invalid) {
      this._notificationService.showError(this._translocoService.translate('staff.edit.error.incompleteFields'));
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formValues = this.form.value;

    // Validaciones específicas según el tipo de staff
    if (this.isEmployee) {
      if (!formValues.staffClassification?.id) {
        this._notificationService.showError(this._translocoService.translate('staff.edit.error.classificationRequired'));
        this.isLoading = false;
        return;
      }
    } else if (this.isBoardMember) {
      if (!formValues.email || !formValues.postalAddress || !formValues.city?.id || !formValues.region?.id || !formValues.areaCode) {
        this._notificationService.showError(this._translocoService.translate('staff.edit.error.contactLocationRequired'));
        this.isLoading = false;
        return;
      }
    }

    const staffTypeId = formValues.staffType?.id || this.data.staff.staffType?.id || 0;
    if (!staffTypeId) {
      this._notificationService.showError(this._translocoService.translate('staff.edit.staffType.required'));
      this.isLoading = false;
      return;
    }

    // Construir request según tipo
    const staffRequest: any = {
      id: this.form.get('id')?.value,
      agencyId: this.agencyId,
      statusId: formValues.status?.id || 0,
      positionId: formValues.position?.id || 0,
      staffTypeId: staffTypeId,
      comments: formValues.comments || '',
      isActive: true,
      firstName: formValues.firstName || '',
      middleName: formValues.middleName || '',
      fatherLastName: formValues.fatherLastName || '',
      motherLastName: formValues.motherLastName || '',
      siteId: formValues.site?.id || null,
      isPrimary: formValues.isPrimary || false,
    };

    // Agregar campos según tipo
    if (!this.isEmployee) {
      staffRequest.email = formValues.email || '';
      staffRequest.postalAddress = formValues.postalAddress || '';
      staffRequest.cityId = formValues.city?.id || 0;
      staffRequest.regionId = formValues.region?.id || 0;
      staffRequest.areaCode = formValues.areaCode || '';
    }

    if (this.isEmployee) {
      staffRequest.staffClassificationId = formValues.staffClassification?.id || 0;
      staffRequest.contractStartDate = formValues.contractStartDate || null;
      staffRequest.contractEndDate = formValues.contractEndDate || null;
    }

    if (this.isBoardMember) {
      staffRequest.birthDate = formValues.birthDate || null;
    }

    // Campos de revisión (solo si tiene permisos)
    if (this.canViewReviewFields) {
      staffRequest.reviewResultId = formValues.reviewResult?.id || null;
      staffRequest.reviewDate = formValues.reviewDate || null;
      staffRequest.reviewJustification = formValues.reviewJustification || null;
    }

    this._staffService.updateStaff(staffRequest, {}).subscribe({
      next: () => {
        this.isLoading = false;
        const successMessage = this.isEmployee 
          ? this._translocoService.translate('staff.edit.success.employee')
          : this._translocoService.translate('staff.edit.success.boardMember');
        this._notificationService.showSuccess(successMessage);
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        this._notificationService.showError(this._translocoService.translate('staff.edit.error.general'));
        console.error('Error updating staff:', error);
      },
    });
  }
}

