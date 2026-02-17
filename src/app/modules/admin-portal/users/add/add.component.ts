import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';

import _ from 'lodash';
import { UsersService } from '../../../../shared/services/users.service';
import { Subject, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';

import { UploadService } from 'app/shared/services/upload.service';
import { RequestUser, SecondaryRoleFormRow, SecondaryRoleInput } from '../users.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { formatDate, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { compareById, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { AgencyService } from 'app/shared/services/agency.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { MatDialog } from '@angular/material/dialog';
import { AddSecondaryRoleModalComponent, AddSecondaryRoleModalResult } from '../add-secondary-role-modal/add-secondary-role-modal.component';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { MatTableDataSource } from '@angular/material/table';
import { SECONDARY_ROLES_COLUMNS_SCHEMA } from '../edit/columns-schema';

@Component({
  selector: 'app-users-add',
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
export class UsersAddComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _usersService: UsersService = inject(UsersService);
  private _agencyService: AgencyService = inject(AgencyService);
  private _uploadService: UploadService = inject(UploadService);
  private _customRouter: CustomRouterService = inject(CustomRouterService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService: TranslocoService = inject(TranslocoService);
  private _fuseConfirmationService: FuseConfirmationService = inject(FuseConfirmationService);
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _userService: UserService = inject(UserService);
  private _matDialog: MatDialog = inject(MatDialog);

  headerConfig: GenericHeaderConfig = {
    title: 'users.add.title',
    formGroup: this._formBuilder.group({
      datosPersonales: this._formBuilder.group(
        {
          username: new FormControl({ value: null, disabled: true }, [Validators.required, Validators.email, this.emailValidator()], [emailExistsValidator(this._userService)]),
          currentPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          newPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          email: new FormControl(null, [Validators.required, Validators.email, this.emailValidator()], [emailExistsValidator(this._userService)]),
          firstName: new FormControl(null, Validators.required),
          middleName: new FormControl(null),
          fatherLastName: new FormControl(null, Validators.required),
          motherLastName: new FormControl(null),
          primaryRole: new FormControl(null, Validators.required),
          secondaryRoles: this._formBuilder.array([]),
          agency: new FormControl(null, Validators.required),
          programs: new FormControl([] as { id: number; name: string }[]),
          isActive: new FormControl(true),
          isTemporalPasswordActived: new FormControl(true),
          emailConfirmed: new FormControl(false),
        },
        {
          validators: this.onPassword.bind(this),
        }
      ),
    }),
    saveButtonShow: true,
    saveButtonText: 'users.add.submit',
    customButtonShow: true,
    customButtonText: 'users.add.secondaryRoles.add',
    customButtonIcon: 'heroicons_solid:plus',
    customButtonIconEnabled: true,
  };

  secondaryRolesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<{ id: number; roleName: string; comment: string; validFrom: string; validTo: string }>(),
    columnsSchema: SECONDARY_ROLES_COLUMNS_SCHEMA,
    displayedColumns: SECONDARY_ROLES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: null as any,
    showPaginator: false,
    fullScreen: false,
  };

  get secondaryRolesTableHandler(): OnGenericTableHandler {
    return {
      tableConfig: this.secondaryRolesTableConfig,
      onTableAction: (event: Event, action: string, id: any) => {
        event?.stopPropagation?.();
        event?.preventDefault?.();
        if (action === 'delete') {
          const index = typeof id === 'number' ? id : parseInt(id, 10);
          if (!isNaN(index)) this.confirmRemoveSecondaryRole(index);
        }
      },
    };
  }

  confirmRemoveSecondaryRole(index: number): void {
    this._fuseConfirmationService
      .open({
        title: this._translocoService.translate('users.edit.secondaryRoles.table.buttons.delete'),
        message: this._translocoService.translate('users.edit.permissions.table.buttons.delete'),
        icon: { show: true, name: 'heroicons_outline:exclamation-triangle', color: 'warn' },
        actions: {
          confirm: { show: true, label: this._translocoService.translate('users.edit.secondaryRoles.table.buttons.delete'), color: 'warn' },
          cancel: { show: true, label: this._translocoService.translate('users.list.delete.cancel') },
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'confirmed') {
          this.removeSecondaryRole(index);
          this.syncSecondaryRolesTableData();
        }
      });
  }

  imageURL: string;
  fileToUpload: File = null;
  fileResponse: FileResponse;

  listRoles = [];
  listAgencies = [];
  listPrograms: { id: number; name: string }[] = [];
  compareById = compareById;

  /** Nombres de roles AESAN (desde API). Si el rol primario está aquí, el auspiciador es siempre AESAN y se oculta el input. */
  aesanRoleNames: string[] = [];
  /** Agencia AESAN en listAgencies (por nombre 'AESAN'). */
  aesanAgency: { id: number; name: string } | null = null;
  /** true = mostrar campo Auspiciador (roles de agencia); false = ocultar y usar siempre AESAN. */
  showAgencyField = true;

  get secondaryRolesArray(): FormArray {
    return this.headerConfig.formGroup.get('datosPersonales')?.get('secondaryRoles') as FormArray;
  }

  // Validador personalizado para email
  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      // Expresión regular para validar email con dominio
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const valid = emailRegex.test(control.value);
      return valid ? null : { invalidEmailFormat: true };
    };
  }

  constructor() {}

  createSecondaryRoleGroup(
    role?: { id: string; name: string } | null,
    validFrom?: string | Date | null,
    validTo?: string | Date | null,
    comment?: string | null,
  ): FormGroup {
    const fromVal = validFrom ? (typeof validFrom === 'string' ? validFrom : (validFrom as Date).toISOString().slice(0, 10)) : null;
    const toVal = validTo ? (typeof validTo === 'string' ? validTo : (validTo as Date).toISOString().slice(0, 10)) : null;
    return this._formBuilder.group(
      {
        role: new FormControl(role ?? null),
        comment: new FormControl(comment ?? null),
        validFrom: new FormControl(fromVal),
        validTo: new FormControl(toVal),
      },
      {
        validators: (g: AbstractControl) => {
          const from = g.get('validFrom')?.value;
          const to = g.get('validTo')?.value;
          if (from && to && new Date(to) <= new Date(from)) return { dateRange: true };
          return null;
        },
      },
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
    const arr = this.secondaryRolesArray;
    const rows: { id: number; roleName: string; comment: string; validFrom: string; validTo: string }[] = [];
    for (let i = 0; i < arr.length; i++) {
      const g = arr.at(i);
      const role = g.get('role')?.value as { id: string; name: string } | null;
      const comment = g.get('comment')?.value ?? '';
      const from = g.get('validFrom')?.value;
      const to = g.get('validTo')?.value;
      const fromStr = this._formatDateShort(from);
      const toStr = this._formatDateShort(to);
      rows.push({ id: i, roleName: role?.name ?? '', comment: comment != null ? String(comment).trim() : '', validFrom: fromStr, validTo: toStr });
    }
    this.secondaryRolesTableConfig.dataSource.data = rows;
    this._changeDetectorRef.markForCheck();
  }

  private _formatDateShort(v: string | Date | null | undefined): string {
    if (v == null) return '';
    const d = typeof v === 'string' ? new Date(v) : v;
    if (isNaN(d.getTime())) return typeof v === 'string' ? v : '';
    return formatDate(d, 'dd/MM/yyyy', 'es');
  }

  onCustom(): void {
    this.openAddSecondaryRoleModal();
  }

  openAddSecondaryRoleModal(): void {
    const primaryRole = this.headerConfig.formGroup.get('datosPersonales')?.get('primaryRole')?.value as { id?: string; Id?: number; name?: string; Name?: string } | null;
    const primaryRoleId = primaryRole != null ? String(primaryRole.id ?? primaryRole.Id ?? '') : undefined;
    const existingSecondaryRoleIds = this.secondaryRolesArray.controls
      .map((c) => c.get('role')?.value?.id ?? c.get('role')?.value?.Id)
      .filter((id) => id != null)
      .map((id) => String(id));
    this._usersService.roles$.pipe(take(1)).subscribe((rolesResponse: any) => {
      const payload = rolesResponse?.body ?? rolesResponse ?? {};
      const list = Array.isArray(payload) ? payload : (payload?.data ?? payload?.Data ?? []);
      const listToPass = (Array.isArray(list) ? list : []).slice().sort((a: any, b: any) =>
        (a?.name ?? a?.Name ?? '').localeCompare(b?.name ?? b?.Name ?? '', 'es')
      );
      const dialogRef = this._matDialog.open(AddSecondaryRoleModalComponent, {
        width: '500px',
        maxWidth: '90vw',
        data: {
          listRoles: listToPass,
          primaryRoleId: primaryRoleId || undefined,
          excludeRoleIds: existingSecondaryRoleIds,
        },
      });
      dialogRef.afterClosed().subscribe((result: AddSecondaryRoleModalResult) => {
        if (result?.role) {
          this.secondaryRolesArray.push(this.createSecondaryRoleGroup(result.role, result.validFrom, result.validTo, result.comment ?? null));
          this.syncSecondaryRolesTableData();
        }
      });
    });
  }

  ngOnInit() {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      const rolesPayload = resolvedData.roles ?? {};
      const rolesList = Array.isArray(rolesPayload) ? rolesPayload : (rolesPayload.data ?? rolesPayload.Data ?? []);
      this.listRoles = (Array.isArray(rolesList) ? rolesList : []).slice().sort((a: any, b: any) =>
        (a?.name ?? a?.Name ?? '').localeCompare(b?.name ?? b?.Name ?? '', 'es')
      );
      this.listAgencies = Array.isArray(resolvedData.agencies) ? resolvedData.agencies : (resolvedData.agencies?.data ?? []);
      this.listPrograms = Array.isArray(resolvedData.programs) ? resolvedData.programs : (resolvedData.programs?.data ?? []);
      this._resolveAesanAgency();
      this._usersService.getAesanRoleNames().pipe(takeUntil(this._unsubscribeAll)).subscribe((names) => {
        this.aesanRoleNames = names ?? [];
        this._applyAgencyVisibilityByPrimaryRole();
        this._changeDetectorRef.markForCheck();
      });
      this._changeDetectorRef.markForCheck();
    }

    // Suscribirse a los cambios del campo email
    this.headerConfig.formGroup
      .get('datosPersonales.email')
      .valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        this.headerConfig.formGroup.get('datosPersonales.username').setValue(value);
      });

    // Mostrar/ocultar campo Auspiciador según rol primario (AESAN vs agencia)
    this.headerConfig.formGroup
      .get('datosPersonales.primaryRole')
      .valueChanges.pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._applyAgencyVisibilityByPrimaryRole();
        this._changeDetectorRef.markForCheck();
      });
  }

  private _resolveAesanAgency(): void {
    const found = (this.listAgencies as { id?: number; name?: string; Name?: string }[]).find(
      (a) => (a.name ?? a.Name ?? '') === 'AESAN'
    );
    this.aesanAgency = found ? { id: found.id ?? 0, name: found.name ?? found.Name ?? 'AESAN' } : null;
  }

  private _isPrimaryRoleAesan(): boolean {
    const role = this.headerConfig.formGroup.get('datosPersonales')?.get('primaryRole')?.value;
    const name = role?.name ?? role?.Name ?? '';
    return name.length > 0 && this.aesanRoleNames.includes(name);
  }

  private _applyAgencyVisibilityByPrimaryRole(): void {
    const datosPersonales = this.headerConfig.formGroup.get('datosPersonales');
    const agencyControl = datosPersonales?.get('agency');
    if (!agencyControl) return;
    const isAesan = this._isPrimaryRoleAesan();
    this.showAgencyField = !isAesan;
    if (isAesan && this.aesanAgency) {
      agencyControl.setValue(this.aesanAgency);
      agencyControl.clearValidators();
    } else {
      agencyControl.setValidators(Validators.required);
    }
    agencyControl.updateValueAndValidity({ emitEvent: false });
  }

  onPassword(formGroup: FormGroup) {
    const { value: password } = formGroup.get('currentPassword');
    const { value: confirmPassword } = formGroup.get('newPassword');
    return password === confirmPassword ? null : { passwordNotMatch: true };
  }

  onUserName(formGroup: FormGroup) {
    const { value: username } = formGroup.get('username');
    const { value: email } = formGroup.get('email');
    return username === email ? null : { emailNotMatch: true };
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSave(): void {
    if (this.headerConfig.formGroup.controls.datosPersonales.valid) {
      this.submitForm(this.headerConfig.formGroup.value.datosPersonales);
    } else {
      this.headerConfig.formGroup.get('datosPersonales').get('currentPassword').setErrors({ passwordNotMatch: true });
      this.headerConfig.formGroup.get('datosPersonales').get('newPassword').setErrors({ passwordNotMatch: true });
      this.headerConfig.formGroup.markAllAsTouched();
    }
  }

  submitForm(form: any) {
    const isAesan = this._isPrimaryRoleAesan();
    const agencyId = isAesan && this.aesanAgency
      ? this.aesanAgency.id
      : form.agency?.id ?? form.agency?.Id;
    if (!agencyId && this.showAgencyField) {
      this.headerConfig.formGroup.get('datosPersonales')?.get('agency')?.setErrors({ required: true });
      this.headerConfig.formGroup.get('datosPersonales')?.get('agency')?.markAsTouched();
      this._changeDetectorRef.markForCheck();
      return;
    }
    const requestParameters: QueryParameters = {
      agencyId,
    };

    // si correo es null, no se puede actualizar
    if (isNullOrUndefinedEmptyStringNullArray(form.email)) {
      this.headerConfig.formGroup.get('datosPersonales').get('email').setErrors({ required: true });
      this.headerConfig.formGroup.get('datosPersonales').get('email').markAsTouched();
      return;
    }

    const primaryRole = form.primaryRole;
    const primaryRoleName = primaryRole?.name ?? (typeof primaryRole === 'string' ? primaryRole : null);
    if (!primaryRoleName) {
      this.headerConfig.formGroup.get('datosPersonales')?.get('primaryRole')?.setErrors({ required: true });
      this.headerConfig.formGroup.get('datosPersonales')?.get('primaryRole')?.markAsTouched();
      return;
    }

    const secondaryRoles: SecondaryRoleInput[] = (form.secondaryRoles ?? [])
      .filter((row: SecondaryRoleFormRow) => row?.role?.name)
      .map((row: SecondaryRoleFormRow) => ({
        roleName: row.role!.name,
        comment: row.comment != null && String(row.comment).trim() !== '' ? String(row.comment).trim() : undefined,
        validFrom: typeof row.validFrom === 'string' ? row.validFrom : (row.validFrom ? new Date(row.validFrom).toISOString().slice(0, 10) : ''),
        validTo: typeof row.validTo === 'string' ? row.validTo : (row.validTo ? new Date(row.validTo).toISOString().slice(0, 10) : ''),
      }))
      .filter((s: SecondaryRoleInput) => s.validFrom && s.validTo);

    const programsList = (form.programs ?? []) as { id: number; name: string }[];
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
      secondaryRoles: secondaryRoles.length > 0 ? secondaryRoles : undefined,
      imageURL: this.imageURL,
      isActive: form.isActive,
      isTemporalPasswordActived: form.isTemporalPasswordActived,
      emailConfirmed: form.emailConfirmed,
      programIds: programIds?.length ? programIds : undefined,
    };

    this._usersService.add(_model, requestParameters).subscribe({
      next: (result: any) => {
        if (result.status === 200) {
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {},
      complete: () => {
        this.onBack();
      },
    });
  }

  onBack() {
    this._customRouter.navigate(['users']);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Upload
  // -----------------------------------------------------------------------------------------------------

  onFileSelected(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const target = event.target as HTMLInputElement;
    this.fileToUpload = (target.files as FileList)[0];

    // Imagen
    let imagenTypes = ['image/jpeg', 'image/jpg', 'image/bmp', 'image/png'];
    let imagenExt = ['jpeg', 'jpg', 'bmp', 'png'];

    if (_.includes(imagenTypes, this.fileToUpload.type) || _.includes(imagenExt, this.fileToUpload.name)) {
      this.onUpload(this.fileToUpload, UploadFolderEnum.Imagen);
    }
  }

  onUpload(file: File, forlderTo: any) {
    var requestParameters: QueryParameters = {
      userId: null,
      description: 'userProfile',
      documentType: 'userProfile',
    };

    this._uploadService.uploadUserAvatar(requestParameters, file).subscribe({
      next: (result) => {
        if (result) {
          this.imageURL = this._uploadService.normalizeImageUrl(result.url);
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {
        // Mostrar mensaje de error
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('users.edit.messages.upload.title'),
          message: this._translocoService.translate('users.edit.messages.upload.error'),
          icon: {
            show: true,
            name: 'heroicons_outline:exclamation-circle',
            color: 'error',
          },
          actions: {
            confirm: {
              show: true,
              label: this._translocoService.translate('dialog.error.confirm'),
              color: 'primary',
            },
            cancel: {
              show: false,
            },
          },
        });
      },
    });
  }

  handleMissingImage(event: Event) {
    this.imageURL = 'assets/images/avatars/profile.png';
  }
}
