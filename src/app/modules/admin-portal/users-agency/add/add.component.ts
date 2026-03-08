import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';

import _ from 'lodash';
import { UsersService } from 'app/shared/services/users.service';
import { Subject, takeUntil } from 'rxjs';

import { UploadService } from 'app/shared/services/upload.service';
import {
  AddSecondaryRoleModalData,
  AddSecondaryRoleModalResult,
  AddUserFormValue,
  AddUserResponse,
  DTORole,
  FuseConfirmationDialogOptions,
  ProgramOption,
  RequestUser,
  SecondaryRoleFormRow,
  SecondaryRoleInput,
  SecondaryRoleTableRow,
} from '../../users/users.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GeoService } from 'app/shared/services/geo.service';
import { City } from 'app/shared/models/location/City';
import { Region } from 'app/shared/models/location/Region';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { compareById, formatDateShort, isNullOrUndefinedEmptyStringNullArray, toIsoDateString } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { emailFormatValidator } from 'app/shared/validators/email-format.validator';
import { MatDialog } from '@angular/material/dialog';
import { AddSecondaryRoleModalComponent } from '../../users/add-secondary-role-modal/add-secondary-role-modal.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SECONDARY_ROLES_COLUMNS_SCHEMA } from '../../users/edit/columns-schema';
import { VALIDATION_ERRORS } from 'app/shared/constants/validation-errors';

@Component({
  selector: 'app-users-agency-add',
  templateUrl: './add.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTabsModule,
    MatInputModule,
    NgFor,
    NgIf,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslocoModule,
    GenericHeaderComponent,
    GenericTableComponent,
  ],
})
export class UsersAgencyAddComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _unsubscribeAll = new Subject<any>();

  private _formBuilder = inject(UntypedFormBuilder);
  private _usersService = inject(UsersService);
  private _geoService = inject(GeoService);
  private _uploadService = inject(UploadService);
  private _customRouter = inject(CustomRouterService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _route = inject(ActivatedRoute);
  private _matDialog = inject(MatDialog);

  isLoading = false;

  headerConfig: GenericHeaderConfig = {
    title: 'usersAgency.add.title',
    formGroup: this._formBuilder.group(
      {
        username: new FormControl({ value: null, disabled: true }, [Validators.required, Validators.email, emailFormatValidator()]),
        currentPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
        newPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
        email: new FormControl(null, [Validators.required, Validators.email, emailFormatValidator()]),
        firstName: new FormControl(null, Validators.required),
        middleName: new FormControl(null),
        fatherLastName: new FormControl(null, Validators.required),
        motherLastName: new FormControl(null),
        agency: new FormControl(null, Validators.required),
        role: new FormControl(null, Validators.required),
        city: new FormControl(null, Validators.required),
        region: new FormControl(null, Validators.required),
        secondaryRoles: this._formBuilder.array([]),
        programs: new FormControl([] as ProgramOption[]),
        isActive: new FormControl(true),
        isTemporalPasswordActived: new FormControl(true),
        emailConfirmed: new FormControl(false),
      },
      { validators: this.onPassword.bind(this) }
    ),
    cancelButtonShow: true,
    cancelButtonText: 'usersAgency.add.back',
    submitButtonShow: true,
    submitButtonText: 'usersAgency.add.submit',
    submitDisabled: true,
    settingsButtonShow: true,
    settingsMenuItems: [
      { id: 'add-secondary-role', label: 'users.add.secondaryRoles.add', icon: 'heroicons_solid:user-plus' },
    ],
  };

  secondaryRolesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<SecondaryRoleTableRow>(),
    columnsSchema: SECONDARY_ROLES_COLUMNS_SCHEMA,
    displayedColumns: SECONDARY_ROLES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: null as any,
    showPaginator: false,
    fullScreen: false,
  };

  imageURL: string;
  fileToUpload: File = null;
  fileResponse: FileResponse;

  listRoles = [];
  listAgencies = [];
  listPrograms: ProgramOption[] = [];
  listCities: City[] = [];
  listRegions: Region[] = [];
  compareById = compareById;

  currentLang = 'es';

  get secondaryRolesTableHandler(): OnGenericTableHandler {
    return {
      tableConfig: this.secondaryRolesTableConfig,
      onTableAction: (event: Event, action: string, id: string | number) => {
        event?.stopPropagation?.();
        event?.preventDefault?.();
        if (action === 'delete') {
          const index = typeof id === 'number' ? id : parseInt(String(id), 10);
          if (!isNaN(index)) this.confirmRemoveSecondaryRole(index);
        }
      },
    };
  }

  get secondaryRolesArray(): FormArray {
    return this.headerConfig.formGroup.get('secondaryRoles') as FormArray;
  }

  ngOnInit(): void {
    const resolvedData = this._route.snapshot.data['data'];
    if (resolvedData) {
      this.listRoles = resolvedData.roles?.data ?? [];
      this.listAgencies = Array.isArray(resolvedData.agencies) ? resolvedData.agencies : (resolvedData.agencies?.data ?? []);
      this.listPrograms = Array.isArray(resolvedData.programs) ? resolvedData.programs : (resolvedData.programs?.data ?? []);
      this.listCities = resolvedData.cities ?? [];
      this.listRegions = resolvedData.regions ?? [];
      this._changeDetectorRef.markForCheck();
    }

    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this.headerConfig.formGroup.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
      this._changeDetectorRef.markForCheck();
    });

    this.headerConfig.formGroup.get('email').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
      this.headerConfig.formGroup.get('username').setValue(value);
    });

    this.currentLang = this._translocoService.getActiveLang() ?? 'es';
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang) => {
      this.currentLang = lang ?? 'es';
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSettingsMenuAction(menuItemId: string): void {
    if (menuItemId === 'add-secondary-role') {
      this.openAddSecondaryRoleModal();
    }
  }

  onSubmit(): void {
    if (this.isLoading) return;
    if (this.headerConfig.formGroup.valid) {
      this.submitForm(this.headerConfig.formGroup.value);
    } else {
      this.headerConfig.formGroup.get('currentPassword').setErrors(VALIDATION_ERRORS.PASSWORD_NOT_MATCH);
      this.headerConfig.formGroup.get('newPassword').setErrors(VALIDATION_ERRORS.PASSWORD_NOT_MATCH);
      this.headerConfig.formGroup.markAllAsTouched();
    }
  }

  onBack(): void {
    this._customRouter.navigate(['..']);
  }

  onCancel(event: Event): void {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    this.onBack();
  }

  onFileSelected(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    this.fileToUpload = (target.files as FileList)?.[0];
    const imagenTypes = ['image/jpeg', 'image/jpg', 'image/bmp', 'image/png'];
    const imagenExt = ['jpeg', 'jpg', 'bmp', 'png'];
    if (this.fileToUpload && (_.includes(imagenTypes, this.fileToUpload.type) || _.includes(imagenExt, this.fileToUpload.name))) {
      this.onUpload(this.fileToUpload, UploadFolderEnum.Imagen);
    }
  }

  onUpload(file: File, folderTo: UploadFolderEnum): void {
    const requestParameters: QueryParameters = { userId: null, description: 'userProfile', documentType: 'userProfile' };
    this._uploadService.uploadUserAvatar(requestParameters, file).subscribe({
      next: (result) => {
        if (result) {
          this.imageURL = this._uploadService.normalizeImageUrl(result.url);
          this._changeDetectorRef.markForCheck();
        }
      },
      error: () => {
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('users.edit.messages.upload.title'),
          message: this._translocoService.translate('users.edit.messages.upload.error'),
          icon: { show: true, name: 'heroicons_outline:exclamation-circle', color: 'error' as const },
          actions: { confirm: { show: true, label: this._translocoService.translate('dialog.error.confirm'), color: 'primary' as const }, cancel: { show: false, label: undefined } },
        });
      },
    });
  }

  confirmRemoveSecondaryRole(index: number): void {
    const options: FuseConfirmationDialogOptions = {
      title: this._translocoService.translate('users.edit.secondaryRoles.table.buttons.delete'),
      message: this._translocoService.translate('users.edit.permissions.table.buttons.delete'),
      icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' as const },
      actions: {
        confirm: { show: true, label: this._translocoService.translate('users.edit.secondaryRoles.table.buttons.delete'), color: 'warn' as const },
        cancel: { show: true, label: this._translocoService.translate('users.list.delete.cancel') },
      },
    };
    this._fuseConfirmationService.open(options).afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this.removeSecondaryRole(index);
        this.syncSecondaryRolesTableData();
      }
    });
  }

  createSecondaryRoleGroup(role?: DTORole | null, validFrom?: string | Date | null, validTo?: string | Date | null): FormGroup {
    const fromVal = toIsoDateString(validFrom);
    const toVal = toIsoDateString(validTo);
    return this._formBuilder.group(
      { role: new FormControl(role ?? null), validFrom: new FormControl(fromVal), validTo: new FormControl(toVal) },
      {
        validators: (g: AbstractControl) => {
          const from = g.get('validFrom')?.value;
          const to = g.get('validTo')?.value;
          if (from && to && new Date(to) <= new Date(from)) return VALIDATION_ERRORS.DATE_RANGE;
          return null;
        },
      }
    );
  }

  addSecondaryRole(): void {
    this.secondaryRolesArray.push(this.createSecondaryRoleGroup());
    this._changeDetectorRef.markForCheck();
  }

  removeSecondaryRole(index: number): void {
    this.secondaryRolesArray.removeAt(index);
    this._changeDetectorRef.markForCheck();
  }

  syncSecondaryRolesTableData(): void {
    this.secondaryRolesTableConfig.dataSource.data = this.secondaryRolesArray.controls.map((g, i) => {
      const role = g.get('role')?.value as DTORole | null;
      const roleName = this.currentLang === 'es' ? (role?.displayName ?? '') : (role?.displayNameEN ?? '');
      return { id: i, roleName, validFrom: formatDateShort(g.get('validFrom')?.value), validTo: formatDateShort(g.get('validTo')?.value) } as SecondaryRoleTableRow;
    });
    this._changeDetectorRef.markForCheck();
  }

  openAddSecondaryRoleModal(): void {
    const role = this.headerConfig.formGroup.get('role')?.value as DTORole | null;
    const primaryRoleId = role?.id ? String(role.id) : undefined;
    const secondaryRoles = this.headerConfig.formGroup.get('secondaryRoles') as FormArray | null;
    const existingSecondaryRoleIds = (secondaryRoles?.controls ?? [])
      .map((c) => (c.get('role')?.value as DTORole)?.id)
      .filter((id) => id != null)
      .map((id) => String(id));

    this._usersService.getAvailableSecondaryRoles(primaryRoleId, existingSecondaryRoleIds).subscribe({
      next: (response) => {
        const availableRoles = response?.body?.data ?? [];
        const modalData: AddSecondaryRoleModalData = { listRoles: availableRoles };
        const dialogRef = this._matDialog.open(AddSecondaryRoleModalComponent, { width: '500px', maxWidth: '90vw', data: modalData });
        dialogRef.afterClosed().subscribe((result: AddSecondaryRoleModalResult) => {
          if (result?.role) {
            this.secondaryRolesArray.push(this.createSecondaryRoleGroup(result.role, result.validFrom, result.validTo));
            this.syncSecondaryRolesTableData();
          }
        });
      },
      error: () => {},
    });
  }

  onPassword(formGroup: FormGroup): ValidationErrors | null {
    const password = formGroup.get('currentPassword')?.value;
    const confirmPassword = formGroup.get('newPassword')?.value;
    return password === confirmPassword ? null : VALIDATION_ERRORS.PASSWORD_NOT_MATCH;
  }

  submitForm(form: AddUserFormValue & { agency?: { id: number } | null }): void {
    const agencyId = form.agency?.id;
    const requestParameters: QueryParameters = { agencyId: agencyId ?? undefined };

    const primaryRoleName = form.role?.name;
    const secondaryRolesPayload: SecondaryRoleInput[] = (form.secondaryRoles ?? [])
      .filter((row: SecondaryRoleFormRow) => row?.role?.name)
      .map((row: SecondaryRoleFormRow) => ({
        roleName: row.role!.name ?? '',
        validFrom: toIsoDateString(row.validFrom) ?? '',
        validTo: toIsoDateString(row.validTo) ?? '',
      }))
      .filter((s: SecondaryRoleInput) => s.validFrom && s.validTo);

    const programsList = (form.programs ?? []) as ProgramOption[];
    const programIds = programsList?.length ? programsList.map((p) => p.id).filter((id) => id > 0) : undefined;

    const _model: RequestUser = {
      firstName: isNullOrUndefinedEmptyStringNullArray(form.firstName) ? null : form.firstName,
      middleName: isNullOrUndefinedEmptyStringNullArray(form.middleName) ? null : form.middleName,
      fatherLastName: isNullOrUndefinedEmptyStringNullArray(form.fatherLastName) ? null : form.fatherLastName,
      motherLastName: isNullOrUndefinedEmptyStringNullArray(form.motherLastName) ? null : form.motherLastName,
      userName: isNullOrUndefinedEmptyStringNullArray(form.email) ? null : form.email,
      email: isNullOrUndefinedEmptyStringNullArray(form.email) ? null : form.email,
      password: isNullOrUndefinedEmptyStringNullArray(form.newPassword) ? null : form.newPassword,
      primaryRoleName,
      secondaryRoles: secondaryRolesPayload.length > 0 ? secondaryRolesPayload : undefined,
      imageURL: this.imageURL,
      isActive: form.isActive,
      isTemporalPasswordActived: form.isTemporalPasswordActived,
      emailConfirmed: form.emailConfirmed,
      programIds: programIds?.length ? programIds : undefined,
      cityId: form.city?.id,
      regionId: form.region?.id,
    };

    this._usersService.add(_model, requestParameters).subscribe({
      next: (result: AddUserResponse) => {
        if (result?.status === 200) this._changeDetectorRef.markForCheck();
      },
      error: () => {},
      complete: () => this.onBack(),
    });
  }

  handleMissingImage(event: Event): void {
    this.imageURL = 'assets/images/avatars/profile.png';
  }

  getRegionsByCityId(city: City, target: string): void {
    if (!city) return;
    const queryParameters: QueryParameters = { cityId: city.id };
    this._geoService.getRegionsByCityId(queryParameters).subscribe({
      next: (response) => {
        if (response?.body?.data && target === 'region') {
          this.listRegions = response.body.data;
          const regionControl = this.headerConfig.formGroup.get('region');
          if (regionControl) {
            if (this.listRegions.length === 1) {
              this.headerConfig.formGroup.patchValue({ region: this.listRegions[0] });
            } else {
              regionControl.setValue(null);
            }
          }
        }
        this._changeDetectorRef.markForCheck();
      },
      error: () => this._changeDetectorRef.markForCheck(),
    });
  }
}
