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
} from '@angular/forms';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';

import _ from 'lodash';
import { UsersService } from '../../../../shared/services/users.service';
import { Subject, takeUntil } from 'rxjs';

import { UploadService } from 'app/shared/services/upload.service';
import {
  AddSecondaryRoleModalData,
  AddSecondaryRoleModalResult,
  AddUserFormValue,
  AddUserResponse,
  AgencyListItem,
  AgencyOption,
  DTORole,
  DateRangeValidationError,
  FormControlDisabledOptions,
  FuseConfirmationDialogOptions,
  InvalidEmailFormatValidationError,
  PasswordNotMatchValidationError,
  ProgramOption,
  RequestUser,
  SecondaryRoleFormRow,
  SecondaryRoleInput,
  SecondaryRoleTableRow,
  RequiredValidationError,
} from '../users.types';
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
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { compareById, formatDateShort, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { AgencyService } from 'app/shared/services/agency.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { emailFormatValidator } from 'app/shared/validators/email-format.validator';
import { MatDialog } from '@angular/material/dialog';
import { AddSecondaryRoleModalComponent } from '../add-secondary-role-modal/add-secondary-role-modal.component';
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
  // -----------------------------------------------------------------------------------------------------
  // @ Subject de desuscripción
  // -----------------------------------------------------------------------------------------------------
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -----------------------------------------------------------------------------------------------------
  // @ Inyecciones privadas
  // -----------------------------------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------------------------------------
  // @ Variables
  // -----------------------------------------------------------------------------------------------------
  /** Constantes de errores de validación (evitar literales inline). */
  private static readonly ERR_REQUIRED: RequiredValidationError = { required: true };
  private static readonly ERR_PASSWORD_NOT_MATCH: PasswordNotMatchValidationError = { passwordNotMatch: true };
  private static readonly ERR_INVALID_EMAIL: InvalidEmailFormatValidationError = { invalidEmailFormat: true };
  private static readonly ERR_DATE_RANGE: DateRangeValidationError = { dateRange: true };
  private static readonly USERNAME_CONTROL_OPTS: FormControlDisabledOptions = { value: null, disabled: true };

  headerConfig: GenericHeaderConfig = {
    title: 'users.add.title',
    formGroup: this._formBuilder.group({
      datosPersonales: this._formBuilder.group(
        {
          username: new FormControl(UsersAddComponent.USERNAME_CONTROL_OPTS, [Validators.required, Validators.email, emailFormatValidator()], [emailExistsValidator(this._userService)]),
          currentPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          newPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          email: new FormControl(null, [Validators.required, Validators.email, emailFormatValidator()], [emailExistsValidator(this._userService)]),
          firstName: new FormControl(null, Validators.required),
          middleName: new FormControl(null),
          fatherLastName: new FormControl(null, Validators.required),
          motherLastName: new FormControl(null),
          primaryRole: new FormControl(null, Validators.required),
          secondaryRoles: this._formBuilder.array([]),
          agency: new FormControl(null, Validators.required),
          programs: new FormControl([] as ProgramOption[]),
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
    settingsButtonShow: true,
    settingsMenuItems: [
      {
        id: 'add-secondary-role',
        label: 'users.add.secondaryRoles.add',
        icon: 'heroicons_solid:user-plus',
      },
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
  compareById = compareById;

  /** Nombres de roles AESAN (desde API). Si el rol primario está aquí, el auspiciador es siempre AESAN y se oculta el input. */
  aesanRoleNames: string[] = [];
  /** Agencia AESAN en listAgencies (por nombre 'AESAN'). */
  aesanAgency: AgencyOption | null = null;
  /** true = mostrar campo Auspiciador (roles de agencia); false = ocultar y usar siempre AESAN. */
  showAgencyField = true;

  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Getters
  // -----------------------------------------------------------------------------------------------------
  /** Devuelve el handler de la tabla de roles secundarios (acciones por fila, p. ej. eliminar). */
  get secondaryRolesTableHandler(): OnGenericTableHandler {
    const handler: OnGenericTableHandler = {
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
    return handler;
  }

  /** Devuelve el FormArray de roles secundarios dentro de datosPersonales. */
  get secondaryRolesArray(): FormArray {
    return this.headerConfig.formGroup.get('datosPersonales')?.get('secondaryRoles') as FormArray;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ ngOnInit / ngOnDestroy
  // -----------------------------------------------------------------------------------------------------
  /** Inicializa el formulario: carga roles, agencias y programas del resolver, sincroniza username con email y muestra/oculta Auspiciador según rol primario. */
  ngOnInit() {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      const rolesPayload = resolvedData.roles ?? {};
      const rolesList = Array.isArray(rolesPayload) ? rolesPayload : (rolesPayload.data ?? rolesPayload.Data ?? []);
      this.listRoles = (Array.isArray(rolesList) ? rolesList : []).slice().sort((a: DTORole, b: DTORole) =>
        (a?.displayName ?? a?.name ?? '').localeCompare(b?.displayName ?? b?.name ?? '', 'es')
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

  /** Cancela suscripciones al destruir el componente. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones On (componentes genéricos)
  // -----------------------------------------------------------------------------------------------------
  /** Ejecuta la acción del menú de configuración del header (p. ej. abrir modal de agregar rol secundario). */
  onSettingsMenuAction(menuItemId: string): void {
    if (menuItemId === 'add-secondary-role') {
      this.openAddSecondaryRoleModal();
    }
  }

  /** Valida el formulario y envía los datos con submitForm, o marca errores de contraseña si no es válido. */
  onSave(): void {
    if (this.headerConfig.formGroup.controls.datosPersonales.valid) {
      this.submitForm(this.headerConfig.formGroup.value.datosPersonales);
    } else {
      this.headerConfig.formGroup.get('datosPersonales').get('currentPassword').setErrors(UsersAddComponent.ERR_PASSWORD_NOT_MATCH);
      this.headerConfig.formGroup.get('datosPersonales').get('newPassword').setErrors(UsersAddComponent.ERR_PASSWORD_NOT_MATCH);
      this.headerConfig.formGroup.markAllAsTouched();
    }
  }

  /** Navega a la lista de usuarios sin guardar. */
  onBack() {
    this._customRouter.navigate(['users']);
  }

  /** Captura el archivo elegido en el input y, si es imagen, lo sube como avatar. */
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

  /** Sube el archivo como avatar de usuario y actualiza imageURL; muestra diálogo de error si falla. */
  onUpload(file: File, folderTo: UploadFolderEnum) {
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
      error: () => {
        const options: FuseConfirmationDialogOptions = {
          title: this._translocoService.translate('users.edit.messages.upload.title'),
          message: this._translocoService.translate('users.edit.messages.upload.error'),
          icon: { show: true, name: 'heroicons_outline:exclamation-circle', color: 'error' as const },
          actions: {
            confirm: {
              show: true,
              label: this._translocoService.translate('dialog.error.confirm'),
              color: 'primary' as const,
            },
            cancel: { show: false, label: undefined },
          },
        };
        this._fuseConfirmationService.open(options);
      },
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Otras funciones públicas
  // -----------------------------------------------------------------------------------------------------
  /** Muestra diálogo de confirmación y, si el usuario confirma, elimina el rol secundario en el índice dado y sincroniza la tabla. */
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
    this._fuseConfirmationService
      .open(options)
      .afterClosed()
      .subscribe((result) => {
        if (result === 'confirmed') {
          this.removeSecondaryRole(index);
          this.syncSecondaryRolesTableData();
        }
      });
  }

  /** Crea un FormGroup para una fila de rol secundario (rol, comentario, vigencia desde/hasta) con validador de rango de fechas. */
  createSecondaryRoleGroup(
    role?: DTORole | null,
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
          if (from && to && new Date(to) <= new Date(from)) return UsersAddComponent.ERR_DATE_RANGE;
          return null;
        },
      },
    );
  }

  /** Añade una fila vacía de rol secundario al formulario. */
  addSecondaryRole(): void {
    this.secondaryRolesArray.push(this.createSecondaryRoleGroup());
    this._changeDetectorRef.markForCheck();
  }

  /** Quita la fila de rol secundario en el índice indicado del FormArray. */
  removeSecondaryRole(index: number): void {
    this.secondaryRolesArray.removeAt(index);
    this._changeDetectorRef.markForCheck();
  }

  /** Actualiza la fuente de datos de la tabla de roles secundarios a partir del FormArray del formulario. */
  syncSecondaryRolesTableData(): void {
    this.secondaryRolesTableConfig.dataSource.data = this.secondaryRolesArray.controls.map((g, i) => ({
      id: i,
      roleName: (g.get('role')?.value as DTORole | null)?.name ?? '',
      comment: String(g.get('comment')?.value ?? '').trim(),
      validFrom: formatDateShort(g.get('validFrom')?.value),
      validTo: formatDateShort(g.get('validTo')?.value),
    })) as SecondaryRoleTableRow[];
    this._changeDetectorRef.markForCheck();
  }

  /** Abre el modal para elegir un rol secundario; pasa lista de roles, rol primario y IDs ya usados para excluirlos. Al confirmar, añade la fila y sincroniza la tabla. */
  openAddSecondaryRoleModal(): void {
    const datosPersonales = this.headerConfig.formGroup.get('datosPersonales');
    const primaryRole = datosPersonales?.get('primaryRole')?.value as DTORole | null;
    const primaryRoleId = primaryRole != null ? String(primaryRole.id ?? '') : undefined;
    const secondaryRoles = datosPersonales?.get('secondaryRoles') as FormArray | null;
    const existingSecondaryRoleIds = (secondaryRoles?.controls ?? [])
      .map((c) => (c.get('role')?.value as DTORole)?.id)
      .filter((id) => id != null)
      .map((id) => String(id));
    const listToPass = (Array.isArray(this.listRoles) ? this.listRoles : []).slice().sort((a: DTORole, b: DTORole) =>
      (a?.displayName ?? a?.name ?? '').localeCompare(b?.displayName ?? b?.name ?? '', 'es')
    );
    const modalData: AddSecondaryRoleModalData = {
      listRoles: listToPass,
      primaryRoleId: primaryRoleId || undefined,
      excludeRoleIds: existingSecondaryRoleIds,
    };
    const dialogRef = this._matDialog.open(AddSecondaryRoleModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: modalData,
    });
    dialogRef.afterClosed().subscribe((result: AddSecondaryRoleModalResult) => {
      if (result?.role) {
        this.secondaryRolesArray.push(this.createSecondaryRoleGroup(result.role, result.validFrom, result.validTo, result.comment ?? null));
        this.syncSecondaryRolesTableData();
      }
    });
  }

  /** Validador del grupo: verifica que contraseña y confirmación coincidan. */
  onPassword(formGroup: FormGroup) {
    const { value: password } = formGroup.get('currentPassword');
    const { value: confirmPassword } = formGroup.get('newPassword');
    return password === confirmPassword ? null : UsersAddComponent.ERR_PASSWORD_NOT_MATCH;
  }

  /** Validador del grupo: verifica que username y email coincidan. */
  onUserName(formGroup: FormGroup) {
    const { value: username } = formGroup.get('username');
    const { value: email } = formGroup.get('email');
    return username === email ? null : { emailNotMatch: true };
  }

  /** Valida datos del formulario, construye RequestUser y llama al servicio para crear el usuario; al terminar navega a la lista. */
  submitForm(form: AddUserFormValue) {
    const isAesan = this._isPrimaryRoleAesan();
    const agencyId = isAesan && this.aesanAgency
      ? this.aesanAgency.id
      : form.agency?.id;
    if (!agencyId && this.showAgencyField) {
      this.headerConfig.formGroup.get('datosPersonales')?.get('agency')?.setErrors(UsersAddComponent.ERR_REQUIRED);
      this.headerConfig.formGroup.get('datosPersonales')?.get('agency')?.markAsTouched();
      this._changeDetectorRef.markForCheck();
      return;
    }
    const requestParameters: QueryParameters = {
      agencyId,
    };

    // si correo es null, no se puede actualizar
    if (isNullOrUndefinedEmptyStringNullArray(form.email)) {
      this.headerConfig.formGroup.get('datosPersonales').get('email').setErrors(UsersAddComponent.ERR_REQUIRED);
      this.headerConfig.formGroup.get('datosPersonales').get('email').markAsTouched();
      return;
    }

    const primaryRole = form.primaryRole;
    const primaryRoleName = primaryRole?.name ?? (typeof primaryRole === 'string' ? primaryRole : null);
    if (!primaryRoleName) {
      this.headerConfig.formGroup.get('datosPersonales')?.get('primaryRole')?.setErrors(UsersAddComponent.ERR_REQUIRED);
      this.headerConfig.formGroup.get('datosPersonales')?.get('primaryRole')?.markAsTouched();
      return;
    }

    const secondaryRolesPayload: SecondaryRoleInput[] = (form.secondaryRoles ?? [])
      .filter((row: SecondaryRoleFormRow) => row?.role?.name)
      .map((row: SecondaryRoleFormRow) => {
        const item: SecondaryRoleInput = {
          roleName: row.role!.name ?? '',
          comment: row.comment != null && String(row.comment).trim() !== '' ? String(row.comment).trim() : undefined,
          validFrom: typeof row.validFrom === 'string' ? row.validFrom : (row.validFrom ? new Date(row.validFrom).toISOString().slice(0, 10) : ''),
          validTo: typeof row.validTo === 'string' ? row.validTo : (row.validTo ? new Date(row.validTo).toISOString().slice(0, 10) : ''),
        };
        return item;
      })
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
    };

    this._usersService.add(_model, requestParameters).subscribe({
      next: (result: AddUserResponse) => {
        if (result?.status === 200) {
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {},
      complete: () => {
        this.onBack();
      },
    });
  }

  /** Sustituye la URL de la imagen por la de avatar por defecto cuando la carga falla. */
  handleMissingImage(event: Event) {
    this.imageURL = 'assets/images/avatars/profile.png';
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones privadas
  // -----------------------------------------------------------------------------------------------------
  /** Busca en listAgencies la agencia con nombre 'AESAN' y la asigna a aesanAgency. */
  private _resolveAesanAgency(): void {
    const agencies = this.listAgencies as AgencyListItem[];
    const found = agencies.find((a) => (a.name ?? a.Name ?? '') === 'AESAN');
    if (found) {
      const agency: AgencyOption = { id: found.id ?? 0, name: found.name ?? found.Name ?? 'AESAN' };
      this.aesanAgency = agency;
    } else {
      this.aesanAgency = null;
    }
  }

  /** Indica si el rol primario seleccionado es uno de los roles AESAN (aesanRoleNames). */
  private _isPrimaryRoleAesan(): boolean {
    const role = this.headerConfig.formGroup.get('datosPersonales')?.get('primaryRole')?.value;
    const name = role?.name ?? '';
    return name.length > 0 && this.aesanRoleNames.includes(name);
  }

  /** Muestra u oculta el campo Auspiciador y configura validación según si el rol primario es AESAN; si es AESAN, fija la agencia y quita validación. */
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
}
