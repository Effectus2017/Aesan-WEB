import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import _ from 'lodash';
import { UsersService } from '../../../../shared/services/users.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { RequestUser, SecondaryRoleInput } from '../users.types';
import { UploadService } from 'app/shared/services/upload.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { compare, compareById, compareString, handleFormControls, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { PERMISSIONS_COLUMNS_SCHEMA, SECONDARY_ROLES_COLUMNS_SCHEMA } from './columns-schema';
import { MatTableDataSource } from '@angular/material/table';
import { Permission } from 'app/shared/models/Permission';
import { PermissionService } from 'app/shared/services/permission.service';
import { MatDialog } from '@angular/material/dialog';
import { AddPermissionModalComponent } from '../add-permission-modal/add-permission-modal.component';
import { AddSecondaryRoleModalComponent, AddSecondaryRoleModalResult } from '../add-secondary-role-modal/add-secondary-role-modal.component';
import { DeletePermissionModalComponent } from '../delete-permission-modal/delete-permission-modal.component';
import { UpdatePasswordModalComponent } from '../update-password-modal/update-password-modal.component';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';

@Component({
  selector: 'app-users-edit',
  templateUrl: './edit.component.html',
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
    MatMenuModule,
    MatDialogModule,
    TranslocoModule,
    GenericHeaderComponent,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    GenericTableComponent,
  ],
})
export class UsersEditComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericTableHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private route: ActivatedRoute = inject(ActivatedRoute);
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _usersService: UsersService = inject(UsersService);
  private _uploadService: UploadService = inject(UploadService);
  private _authService: AuthService = inject(AuthService);
  private _customRouter: CustomRouterService = inject(CustomRouterService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _permissionsService: PermissionService = inject(PermissionService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _userService: UserService = inject(UserService);

  // Email original para excluir de la validación en edición
  originalEmail: string = '';

  savingSecondaryRole = false;

  headerConfig: GenericHeaderConfig = {
    title: 'users.edit.title',
    formGroup: this._formBuilder.group({
        email: new FormControl({ value: null, readonly: false }, [Validators.required, Validators.email], [emailExistsValidator(this._userService, this.originalEmail)]),
        firstName: new FormControl(null, Validators.required),
        middleName: new FormControl(null),
        fatherLastName: new FormControl(null, Validators.required),
        motherLastName: new FormControl(null),
        primaryRole: new FormControl(null, Validators.required),
        secondaryRoles: this._formBuilder.array([]),
        agency: new FormControl(null),
        program: new FormControl(null),
        isActive: new FormControl(null),
        isTemporalPasswordActived: new FormControl(null),
        emailConfirmed: new FormControl(null),
    }),
    saveButtonShow: true,
    saveButtonText: 'users.edit.buttons.save',
    settingsButtonShow: true,
    settingsMenuItems: [
      {
        id: 'force-password',
        label: 'users.edit.buttons.force-password',
        icon: 'heroicons_solid:lock-closed',
      },
      {
        id: 'update-password',
        label: 'users.edit.buttons.update-password',
        icon: 'heroicons_solid:key',
      },
      {
        id: 'add-secondary-role',
        label: 'users.edit.secondaryRoles.add',
        icon: 'heroicons_solid:user-plus',
      },
    ],
  };

  tableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<Permission>(),
    dataSourceList: [],
    columnsSchema: PERMISSIONS_COLUMNS_SCHEMA,
    displayedColumns: PERMISSIONS_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: this,
    showPaginator: true,
    pageSize: 15,
    pageSizeOptions: [15, 50, 100],
    length: 0,
    addMenuShow: true,
    fullScreen: false,
    addMenuItems: [
      {
        id: 'add',
        label: 'global.buttons.addPermission',
      },
    ],
    addMenuTooltip: 'global.tooltips.addPermission',
  };

  secondaryRolesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<{ id: number; roleName: string; validFrom: string; validTo: string }>(),
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
        message: this._translocoService.translate('users.edit.secondaryRoles.table.deleteConfirmMessage'),
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

  id?: string = null;
  user?: any;

  listRoles: any[] = [];
  listAgencies: any[] = [];
  listPrograms: { id: number; name: string }[] = [];

  userRole: string = null;

  compare = compare;
  compareById = compareById;
  compareString = compareString;

  get secondaryRolesArray(): FormArray {
    return this.headerConfig.formGroup.get('secondaryRoles') as FormArray;
  }

  constructor() {}

  createSecondaryRoleGroup(role?: { id: string; name: string } | null, validFrom?: string | Date | null, validTo?: string | Date | null): FormGroup {
    const fromVal = validFrom ? (typeof validFrom === 'string' ? validFrom : (validFrom as Date).toISOString().slice(0, 10)) : null;
    const toVal = validTo ? (typeof validTo === 'string' ? validTo : (validTo as Date).toISOString().slice(0, 10)) : null;
    return this._formBuilder.group({
      role: new FormControl(role ?? null),
      validFrom: new FormControl(fromVal),
      validTo: new FormControl(toVal),
    }, {
      validators: (g: AbstractControl) => {
        const from = g.get('validFrom')?.value;
        const to = g.get('validTo')?.value;
        if (from && to && new Date(to) <= new Date(from)) {
          return { dateRange: true };
        }
        return null;
      },
    });
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
    const rows: { id: number; roleName: string; validFrom: string; validTo: string }[] = [];
    for (let i = 0; i < arr.length; i++) {
      const g = arr.at(i);
      const role = g.get('role')?.value as { id: string; name: string } | null;
      const from = g.get('validFrom')?.value;
      const to = g.get('validTo')?.value;
      const fromStr = from ? (typeof from === 'string' ? from : (from as Date).toISOString().slice(0, 10)) : '';
      const toStr = to ? (typeof to === 'string' ? to : (to as Date).toISOString().slice(0, 10)) : '';
      rows.push({ id: i, roleName: role?.name ?? '', validFrom: fromStr, validTo: toStr });
    }
    this.secondaryRolesTableConfig.dataSource.data = rows;
    this._changeDetectorRef.markForCheck();
  }

  ngOnInit() {
    this.userRole = this._authService.getUserRole();
    const isAdmin = this.userRole === 'Administrator' || this.userRole === 'Super-Administrator';
    this.headerConfig.settingsMenuItems = [
      { id: 'force-password', label: 'users.edit.buttons.force-password', icon: 'heroicons_solid:lock-closed' },
      { id: 'update-password', label: 'users.edit.buttons.update-password', icon: 'heroicons_solid:key' },
      ...(isAdmin ? [{ id: 'add-secondary-role', label: 'users.edit.secondaryRoles.add', icon: 'heroicons_solid:user-plus' }] : []),
    ];

    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this.route.snapshot.data['data'];

    if (resolvedData) {
      // Asignar datos directamente desde el resolver
      this.user = resolvedData.user;
      const rolesPayload = resolvedData.roles ?? {};
      const rolesList = Array.isArray(rolesPayload) ? rolesPayload : (rolesPayload.data ?? rolesPayload.Data ?? []);
      this.listRoles = (Array.isArray(rolesList) ? rolesList : []).slice().sort((a: any, b: any) =>
        (a?.name ?? a?.Name ?? '').localeCompare(b?.name ?? b?.Name ?? '', 'es')
      );
      this.listAgencies = Array.isArray(resolvedData.agencies) ? resolvedData.agencies : (resolvedData.agencies?.data ?? []);
      this.listPrograms = Array.isArray(resolvedData.programs) ? resolvedData.programs : (resolvedData.programs?.data ?? []);

      // Configurar permisos si existen
      if (resolvedData.permissions) {
        this.tableConfig.dataSource.data = resolvedData.permissions.data || resolvedData.permissions;
        this.tableConfig.length = resolvedData.permissions.count || resolvedData.permissions.length;
      }

      // Configurar el formulario con los datos del usuario
      this.onSetForm(this.user);

      this._changeDetectorRef.markForCheck();
    }

  }

  onPassword(formGroup: FormGroup) {
    const { value: password } = formGroup.get('currentPassword');
    const { value: confirmPassword } = formGroup.get('newPassword');
    return password === confirmPassword ? null : { passwordNotMatch: true };
  }

  onUserName(formGroup: FormGroup) {
    const { value: userName } = formGroup.get('userName');
    const { value: email } = formGroup.get('email');
    return userName === email ? null : { emailNotMatch: true };
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: any) {
    this.id = param.id;
    this.user = param;

    // Guardar el email original para excluirlo de la validación
    this.originalEmail = param.email || '';

    // Limpiar la URL de la imagen si contiene barras invertidas
    if (param.imageURL) {
      this.imageURL = this._uploadService.normalizeImageUrl(param.imageURL);
    } else {
      this.imageURL = param.imageURL;
    }

    const selectedPrimaryRole = this.getPrimaryRoleFromUser();
    const agencyId = this.user.agency?.id ?? this.user.agencyId;
    const selectedAgency = agencyId
      ? (this.listAgencies?.find((a: { id: number }) => a.id === agencyId) ?? this.user.agency ?? { id: agencyId, name: this.user.agencyName ?? '' })
      : null;
    const programId = this.user.programId ?? this.user.program?.id;
    const selectedProgram = programId
      ? (this.listPrograms?.find((p: { id: number }) => p.id === programId) ?? { id: programId, name: this.user.programName ?? this.user.program?.name ?? '' })
      : null;
    this.headerConfig.formGroup.patchValue({
      email: this.user.email,
      firstName: this.user.firstName,
      middleName: this.user.middleName,
      fatherLastName: this.user.fatherLastName,
      motherLastName: this.user.motherLastName,
      isActive: this.user.isActive,
      isTemporalPasswordActived: this.user.isTemporalPasswordActived,
      emailConfirmed: this.user.emailConfirmed,
      primaryRole: selectedPrimaryRole,
      agency: selectedAgency,
      program: selectedProgram,
    });
    const secondaryRows = this.getSecondaryRolesFromUser();
    this.secondaryRolesArray.clear();
    secondaryRows.forEach((row) => {
      this.secondaryRolesArray.push(this.createSecondaryRoleGroup(row.role, row.validFrom, row.validTo));
    });
    this.syncSecondaryRolesTableData();

    // Actualizar el validador de email con el email original
    const emailControl = this.headerConfig.formGroup.get('email');
    if (emailControl) {
      emailControl.clearAsyncValidators();
      emailControl.setAsyncValidators([emailExistsValidator(this._userService, this.originalEmail)]);
      emailControl.updateValueAndValidity();
    }

    this.disableEditableFormControls();
  }

  private getPrimaryRoleFromUser(): { id: string; name: string } | null {
    const primaryName = this.user?.primaryRoleName;
    if (primaryName) {
      const found = this.listRoles?.find((r: { name: string }) => r.name === primaryName);
      return found ?? null;
    }
    const roleNames = this.user?.roles ?? (this.user?.role ? [this.user.role.name] : []);
    const first = roleNames?.[0];
    if (!first) return null;
    return this.listRoles?.find((r: { name: string }) => r.name === first) ?? null;
  }

  private getSecondaryRolesFromUser(): { role: { id: string; name: string } | null; validFrom: string | null; validTo: string | null }[] {
    const list = this.user?.secondaryRoles ?? [];
    if (!Array.isArray(list) || !list.length) return [];
    return list.map((s: { roleName?: string; validFrom?: string; validTo?: string }) => {
      const role = s.roleName ? (this.listRoles?.find((r: { name: string }) => r.name === s.roleName) ?? null) : null;
      const from = s.validFrom ?? null;
      const to = s.validTo ?? null;
      return { role, validFrom: from, validTo: to };
    });
  }

  getById() {
    const requestParameters: QueryParameters = {
      userId: this.id,
    };

    this._usersService.getUserByIdWithSP(requestParameters).subscribe();
  }

  // Método para manejar acciones del menú de settings
  onSettingsMenuAction(menuItemId: string): void {
    switch (menuItemId) {
      case 'force-password':
        this.onForcePassword();
        break;
      case 'update-password':
        this.openUpdatePasswordModal();
        break;
      case 'add-secondary-role':
        this.openAddSecondaryRoleModal();
        break;
      default:
        console.warn(`Acción de menú no reconocida: ${menuItemId}`);
    }
  }

  // Para cuando se actualiza el usuario. save button
  onSave(): void {
    if (this.headerConfig.formGroup.valid) {
      this.onUpdate(this.headerConfig.formGroup.value);
    } else {
      this.headerConfig.formGroup.markAllAsTouched();
    }
  }

  onCustom(): void {
    this.openAddSecondaryRoleModal();
  }

  openAddSecondaryRoleModal(): void {
    const primaryRole = this.headerConfig.formGroup.get('primaryRole')?.value as { id?: string; Id?: number; name?: string; Name?: string } | null;
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
          this.secondaryRolesArray.push(this.createSecondaryRoleGroup(result.role, result.validFrom, result.validTo));
          this.syncSecondaryRolesTableData();
          this.saveSecondaryRolesToBackend();
        }
      });
    });
  }

  private setAddSecondaryRoleMenuItemDisabled(disabled: boolean): void {
    const item = this.headerConfig.settingsMenuItems?.find((i) => i.id === 'add-secondary-role');
    if (item) {
      item.disabled = disabled;
    }
  }

  private saveSecondaryRolesToBackend(): void {
    this.savingSecondaryRole = true;
    this.setAddSecondaryRoleMenuItemDisabled(true);
    this._changeDetectorRef.markForCheck();
    const form = this.headerConfig.formGroup.value;
    const loggedInUserId = this._authService.getUserId();
    const primaryRoleControl = this.headerConfig.formGroup.get('primaryRole');
    const isOwnProfile = loggedInUserId === this.id;
    const rolesDisabled = primaryRoleControl?.disabled === true;

    let primaryRoleName: string;
    if (isOwnProfile && rolesDisabled) {
      primaryRoleName = this.user?.primaryRoleName ?? (this.user?.roles?.[0] ?? this.user?.role?.name ?? '');
    } else {
      const primaryRole = form.primaryRole;
      primaryRoleName = primaryRole?.name ?? (typeof primaryRole === 'string' ? primaryRole : '');
      if (!primaryRoleName) {
        primaryRoleControl?.setErrors({ required: true });
        primaryRoleControl?.markAsTouched();
        this.revertLastSecondaryRole();
        return;
      }
    }
    const secondaryRows = (form.secondaryRoles ?? []) as { role?: { name: string }; validFrom?: string | Date; validTo?: string | Date }[];
    let secondaryRolesPayload: SecondaryRoleInput[] | undefined = secondaryRows
      .filter((row) => row?.role?.name)
      .map((row) => ({
        roleName: row.role!.name,
        validFrom: typeof row.validFrom === 'string' ? row.validFrom.slice(0, 10) : (row.validFrom ? new Date(row.validFrom).toISOString().slice(0, 10) : ''),
        validTo: typeof row.validTo === 'string' ? row.validTo.slice(0, 10) : (row.validTo ? new Date(row.validTo).toISOString().slice(0, 10) : ''),
      }))
      .filter((s) => s.validFrom && s.validTo);
    if (secondaryRolesPayload.length === 0) secondaryRolesPayload = undefined;

    const requestParameters: QueryParameters = { currentUserId: loggedInUserId };
    const agencyId = form.agency?.id ?? this.user.agency?.id;
    const programId = form.program?.id ?? form.programId ?? undefined;
    const _model: RequestUser = {
      id: this.id,
      firstName: isNullOrUndefinedEmptyStringNullArray(form.firstName) ? null : form.firstName,
      middleName: isNullOrUndefinedEmptyStringNullArray(form.middleName) ? null : form.middleName,
      fatherLastName: isNullOrUndefinedEmptyStringNullArray(form.fatherLastName) ? null : form.fatherLastName,
      motherLastName: isNullOrUndefinedEmptyStringNullArray(form.motherLastName) ? null : form.motherLastName,
      email: isNullOrUndefinedEmptyStringNullArray(form.email) ? this.user.email : form.email,
      userName: this.user.userName,
      imageURL: this.imageURL,
      primaryRoleName,
      secondaryRoles: secondaryRolesPayload,
      agencyId: agencyId,
      programId: programId,
      isActive: form.isActive,
      isTemporalPasswordActived: form.isTemporalPasswordActived,
      emailConfirmed: form.emailConfirmed,
    };

    this._usersService.updateWithSP(_model, requestParameters).subscribe({
      next: (result: any) => {
        this.savingSecondaryRole = false;
        this.setAddSecondaryRoleMenuItemDisabled(false);
        this._changeDetectorRef.markForCheck();
        if (result.status === 200) {
          this._usersService.getUserByIdWithSP({ userId: this.id }).subscribe({
            next: (res: any) => {
              if (res?.body) {
                this.onSetForm(res.body);
              }
              this._changeDetectorRef.markForCheck();
            },
          });
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('users.update.success.title'),
            message: result.body?.message || this._translocoService.translate('users.update.success.message'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            actions: {
              confirm: {
                show: true,
                label: this._translocoService.translate('dialog.success.confirm'),
                color: 'primary',
              },
              cancel: { show: false },
            },
          });
        }
      },
      error: () => {
        this.savingSecondaryRole = false;
        this.setAddSecondaryRoleMenuItemDisabled(false);
        this.revertLastSecondaryRole();
        this._changeDetectorRef.markForCheck();
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('users.update.error.title'),
          message: this._translocoService.translate('users.update.error.message'),
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
            cancel: { show: false },
          },
        });
      },
    });
  }

  private revertLastSecondaryRole(): void {
    if (this.secondaryRolesArray.length > 0) {
      this.secondaryRolesArray.removeAt(this.secondaryRolesArray.length - 1);
      this.syncSecondaryRolesTableData();
    }
  }

  // Para cuando se cancela el usuario. cancel button
  onCancel(): void {
    this._customRouter.navigate(['users']);
  }

  // Para cuando se actualiza el usuario, excepto la contraseña
  onUpdate(form: any) {
    // si correo es null, no se puede actualizar
    if (isNullOrUndefinedEmptyStringNullArray(form.email) && isNullOrUndefinedEmptyStringNullArray(this.user.email)) {
      this.headerConfig.formGroup.get('email').setErrors({ required: true });
      this.headerConfig.formGroup.get('email').markAsTouched();
      return;
    }

    const loggedInUserId = this._authService.getUserId();
    const primaryRoleControl = this.headerConfig.formGroup.get('primaryRole');
    const isOwnProfile = loggedInUserId === this.id;
    const rolesDisabled = primaryRoleControl?.disabled === true;

    let primaryRoleName: string;
    let secondaryRolesPayload: SecondaryRoleInput[] | undefined;

    if (isOwnProfile && rolesDisabled) {
      primaryRoleName = this.user?.primaryRoleName ?? (this.user?.roles?.[0] ?? this.user?.role?.name ?? '');
      const list = this.user?.secondaryRoles ?? [];
      secondaryRolesPayload = Array.isArray(list)
        ? list
            .filter((s: { roleName?: string; validFrom?: string; validTo?: string }) => s.roleName && s.validFrom && s.validTo)
            .map((s: { roleName: string; validFrom: string; validTo: string }) => ({
              roleName: s.roleName,
              validFrom: typeof s.validFrom === 'string' ? s.validFrom.slice(0, 10) : '',
              validTo: typeof s.validTo === 'string' ? s.validTo.slice(0, 10) : '',
            }))
        : undefined;
    } else {
      const primaryRole = form.primaryRole;
      primaryRoleName = primaryRole?.name ?? (typeof primaryRole === 'string' ? primaryRole : '');
      if (!primaryRoleName) {
        primaryRoleControl?.setErrors({ required: true });
        primaryRoleControl?.markAsTouched();
        return;
      }
      const secondaryRows = (form.secondaryRoles ?? []) as { role?: { name: string }; validFrom?: string | Date; validTo?: string | Date }[];
      secondaryRolesPayload = secondaryRows
        .filter((row) => row?.role?.name)
        .map((row) => ({
          roleName: row.role!.name,
          validFrom: typeof row.validFrom === 'string' ? row.validFrom.slice(0, 10) : (row.validFrom ? new Date(row.validFrom).toISOString().slice(0, 10) : ''),
          validTo: typeof row.validTo === 'string' ? row.validTo.slice(0, 10) : (row.validTo ? new Date(row.validTo).toISOString().slice(0, 10) : ''),
        }))
        .filter((s) => s.validFrom && s.validTo);
      if (secondaryRolesPayload.length === 0) secondaryRolesPayload = undefined;
    }

    const requestParameters: QueryParameters = {
      currentUserId: loggedInUserId,
    };

    const agencyId = form.agency?.id ?? this.user.agency?.id;
    const programId = form.program?.id ?? form.programId ?? undefined;
    const _model: RequestUser = {
      id: this.id,
      firstName: isNullOrUndefinedEmptyStringNullArray(form.firstName) ? null : form.firstName,
      middleName: isNullOrUndefinedEmptyStringNullArray(form.middleName) ? null : form.middleName,
      fatherLastName: isNullOrUndefinedEmptyStringNullArray(form.fatherLastName) ? null : form.fatherLastName,
      motherLastName: isNullOrUndefinedEmptyStringNullArray(form.motherLastName) ? null : form.motherLastName,
      email: isNullOrUndefinedEmptyStringNullArray(form.email) ? this.user.email : form.email,
      userName: this.user.userName,
      imageURL: this.imageURL,
      primaryRoleName,
      secondaryRoles: secondaryRolesPayload,
      agencyId: agencyId,
      programId: programId,
      isActive: form.isActive,
      isTemporalPasswordActived: form.isTemporalPasswordActived,
      emailConfirmed: form.emailConfirmed,
    };

    this._usersService.updateWithSP(_model, requestParameters).subscribe({
      next: (result: any) => {
        if (result.status === 200) {
          this._usersService.getUserByIdWithSP({ userId: this.id }).subscribe();
          this._changeDetectorRef.markForCheck();

          // Mostrar mensaje de éxito
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('users.update.success.title'),
            message: result.body?.message || this._translocoService.translate('users.update.success.message'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            actions: {
              confirm: {
                show: true,
                label: this._translocoService.translate('dialog.success.confirm'),
                color: 'primary',
              },
              cancel: {
                show: false,
              },
            },
          });
        }
      },
      error: () => {
        // Mostrar mensaje de error
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('users.update.error.title'),
          message: this._translocoService.translate('users.update.error.message'),
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
      complete: () => {
        //this.enableEditableFormControls();
      },
    });
  }

  // Para cuando se actualiza la contraseña, para uso del usuario
  onUpdatePassword(form: any) {
    const requestParameters: QueryParameters = {
      userId: this.id,
      password: form.currentPassword,
      newPassword: form.newPassword,
    };

    this._usersService.changePassword(requestParameters).subscribe({
      next: (result: any) => {
        if (result.status === 200) {
          const requestParameters: QueryParameters = {
            userId: this.id,
          };
          this._usersService.getUserByIdWithSP(requestParameters).subscribe();
          this._changeDetectorRef.markForCheck();

          // Mostrar mensaje de éxito
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('users.password.success.title'),
            message: result.body?.message || this._translocoService.translate('users.password.success.message'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            actions: {
              confirm: {
                show: true,
                label: this._translocoService.translate('dialog.success.confirm'),
                color: 'primary',
              },
              cancel: {
                show: false,
              },
            },
          });
        }
      },
      error: () => {
        // Mostrar mensaje de error
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('users.password.error.title'),
          message: this._translocoService.translate('users.password.error.message'),
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
      complete: () => {},
    });
  }

  // Para cuando se resetea la contraseña, para uso del administrador
  onResetPassword() {
    const requestParameters: QueryParameters = {
      userId: this.id,
      password: this.headerConfig.formGroup.value.password.newPassword,
      newPassword: this.headerConfig.formGroup.value.password.newPassword,
    };

    this._usersService.resetPassword(requestParameters).subscribe({
      next: (result: any) => {
        if (result.status === 200) {
          this._usersService.getUserByIdWithSP({ userId: this.id }).subscribe();
          this._changeDetectorRef.markForCheck();

          // Mostrar mensaje de éxito
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('users.password.reset.success.title'),
            message: result.body?.message || this._translocoService.translate('users.password.reset.success.message'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            actions: {
              confirm: {
                show: true,
                label: this._translocoService.translate('dialog.success.confirm'),
                color: 'primary',
              },
              cancel: {
                show: false,
              },
            },
          });
        }
      },
      error: () => {
        // Mostrar mensaje de error
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('users.password.reset.error.title'),
          message: this._translocoService.translate('users.password.reset.error.message'),
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
      complete: () => {},
    });
  }

  // Para cuando se fuerza la contraseña
  onForcePassword() {
    // Mostrar diálogo de confirmación antes de ejecutar la acción
    this._fuseConfirmationService.open({
      title: this._translocoService.translate('users.edit.messages.force-password.confirmation.title'),
      message: this._translocoService.translate('users.edit.messages.force-password.confirmation.message'),
      icon: {
        show: true,
        name: 'heroicons_outline:exclamation-triangle',
        color: 'warning',
      },
      actions: {
        confirm: {
          show: true,
          label: this._translocoService.translate('dialog.confirm.confirm'),
          color: 'warn',
        },
        cancel: {
          show: true,
          label: this._translocoService.translate('dialog.confirm.cancel'),
        },
      },
      dismissible: true,
    }).afterClosed().subscribe((result) => {
      // Solo ejecutar si el usuario confirmó
      if (result === 'confirmed') {
        const requestParameters: QueryParameters = {
          userId: this.id,
        };

        this._usersService.forcePassword(requestParameters).subscribe({
          next: (result: any) => {
            if (result.status === 200) {
              this._fuseConfirmationService.open({
                title: this._translocoService.translate('users.edit.messages.force-password.title'),
                message: this._translocoService.translate('users.edit.messages.force-password.success'),
                icon: {
                  show: true,
                  name: 'heroicons_outline:check-circle',
                  color: 'success',
                },
                actions: {
                  confirm: {
                    show: true,
                    label: this._translocoService.translate('dialog.success.confirm'),
                    color: 'primary',
                  },
                  cancel: {
                    show: false,
                  },
                },
              });
            }
          },
          error: () => {
            this._fuseConfirmationService.open({
              title: this._translocoService.translate('users.edit.messages.force-password.title'),
              message: this._translocoService.translate('users.edit.messages.force-password.error'),
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
    });
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
      userId: this.id,
      description: 'userProfile',
      documentType: 'userProfile',
    };

    this._uploadService.uploadUserAvatar(requestParameters, file).subscribe({
      next: (result) => {
        if (result) {
          // Normalizar la URL para evitar problemas con barras invertidas
          this.imageURL = this._uploadService.normalizeImageUrl(result.url);

          // Actualizar el avatar del usuario automáticamente
          this._usersService.updateUserAvatar(this.id, this.imageURL).subscribe({
            next: (avatarResult: any) => {
              // Comprobar si la operación fue exitosa
              const isSuccess = avatarResult && (avatarResult.status === 200 || (avatarResult.body && (avatarResult.body.valid === true || avatarResult.body.statusCode === 200)));

              if (isSuccess) {
                this._fuseConfirmationService.open({
                  title: this._translocoService.translate('users.edit.messages.avatar.title'),
                  message: avatarResult.body?.message || this._translocoService.translate('users.edit.messages.avatar.success'),
                  icon: {
                    show: true,
                    name: 'heroicons_outline:check-circle',
                    color: 'success',
                  },
                  actions: {
                    confirm: {
                      show: true,
                      label: this._translocoService.translate('dialog.success.confirm'),
                      color: 'primary',
                    },
                    cancel: {
                      show: false,
                    },
                  },
                });

                // Actualizar la vista
                this._usersService.getUserByIdWithSP({ userId: this.id }).subscribe();
              } else {
                // Si no es éxito pero tampoco hubo un error, mostrar un mensaje genérico
                this._fuseConfirmationService.open({
                  title: this._translocoService.translate('users.edit.messages.avatar.title'),
                  message: this._translocoService.translate('users.edit.messages.avatar.error'),
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
              }
            },
            error: () => {
              // Mostrar mensaje de error
              this._fuseConfirmationService.open({
                title: this._translocoService.translate('users.edit.messages.avatar.title'),
                message: this._translocoService.translate('users.edit.messages.avatar.error'),
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

          this._changeDetectorRef.markForCheck();
        }
      },
      error: () => {
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

  /**
   * Deshabilita los controles editables del formulario
   */
  private disableEditableFormControls(): void {
    // Deshabilitar todos los controles excepto email y otros campos sensibles
    handleFormControls(this.headerConfig.formGroup as UntypedFormGroup, 'disable', {
      controls: ['email', 'userName'],
      mode: 'include',
    });

    // Obtener el ID del usuario logueado
    const loggedInUserId = this._authService.getUserId();

    // Si el usuario que se está editando es el mismo que está logueado,
    // deshabilitar rol principal y roles secundarios para evitar que cambie sus propios roles
    if (loggedInUserId === this.id) {
      this.headerConfig.formGroup.get('primaryRole')?.disable();
      this.secondaryRolesArray.controls.forEach((c) => c.disable());
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Permission Modal Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Abre el modal para agregar permisos
   */
  openAddPermissionModal(): void {
    const dialogRef = this._matDialog.open(AddPermissionModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        userId: this.id,
        userName: this.user?.firstName + ' ' + this.user?.fatherLastName,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        // Recargar los permisos del usuario
        this.loadUserPermissions();
      }
    });
  }

  /**
   * Método requerido por GenericTable para el botón de agregar
   */
  onAdd(): void {
    this.openAddPermissionModal();
  }

  /**
   * Abre el modal para actualizar contraseña
   */
  openUpdatePasswordModal(): void {
    const dialogRef = this._matDialog.open(UpdatePasswordModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        userId: this.id,
        userName: this.user?.firstName + ' ' + this.user?.fatherLastName,
        userRole: this.userRole,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        // Recargar los datos del usuario
        this._usersService.getUserByIdWithSP({ userId: this.id }).subscribe({
          next: (result: any) => {
            if (result?.body) {
              this.onSetForm(result.body);
              this._changeDetectorRef.markForCheck();
            }
          },
        });
      }
    });
  }

  /**
   * Abre el modal para eliminar permisos
   */
  openDeletePermissionModal(permission: Permission): void {
    const dialogRef = this._matDialog.open(DeletePermissionModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        userId: this.id,
        userName: this.user?.firstName + ' ' + this.user?.fatherLastName,
        permission: permission,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        // Recargar los permisos del usuario
        this.loadUserPermissions();
      }
    });
  }

  /**
   * Carga los permisos del usuario
   */
  private loadUserPermissions(): void {
    const requestParameters: QueryParameters = {
      userId: this.id,
    };

    this._permissionsService.getUserPermissions(requestParameters).subscribe({
      next: (result: any) => {
        if (result?.body?.data) {
          this.tableConfig.dataSource.data = result.body.data;
          this.tableConfig.length = result.body.count || result.body.data.length;
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {
        console.error('Error loading user permissions:', error);
      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Generic Table Handler Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Maneja los eventos de la tabla de permisos
   */
  onTableAction(event: Event, action: string, item: any): void {
    event.stopPropagation();
    event.preventDefault();

    switch (action) {
      case 'delete':
        this.openDeletePermissionModal(item);
        break;
      default:
        console.warn('Unknown table action:', action);
        break;
    }
  }

  /**
   * Método requerido por OnGenericTableHandler para eliminar permisos
   */
  onTableDelete(event: Event, id: any): void {
    event.stopPropagation();
    event.preventDefault();

    // Buscar el permiso por ID en la tabla
    const permission = this.tableConfig.dataSource.data.find(p => p.id === id);
    if (permission) {
      this.openDeletePermissionModal(permission);
    } else {
      console.warn('Permission not found with id:', id);
    }
  }

  /**
   * Maneja las acciones del menú de agregar
   */
  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.openAddPermissionModal();
    }
  }
}
