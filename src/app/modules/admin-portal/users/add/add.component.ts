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
  AgencyOption,
  DTORole,
  FuseConfirmationDialogOptions,
  ProgramOption,
  RequestUser,
  SecondaryRoleFormRow,
  SecondaryRoleInput,
  SecondaryRoleTableRow,
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
import { AuthService } from 'app/core/auth/auth.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { GeoService } from 'app/shared/services/geo.service';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { compareById, formatDateShort, isNullOrUndefinedEmptyStringNullArray, toIsoDateString } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
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
import { VALIDATION_ERRORS } from 'app/shared/constants/validation-errors';

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
  private _geoService: GeoService = inject(GeoService);
  private _uploadService: UploadService = inject(UploadService);
  private _customRouter: CustomRouterService = inject(CustomRouterService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService: TranslocoService = inject(TranslocoService);
  private _fuseConfirmationService: FuseConfirmationService = inject(FuseConfirmationService);
  private _route: ActivatedRoute = inject(ActivatedRoute);
  private _userService: UserService = inject(UserService);
  private _matDialog: MatDialog = inject(MatDialog);
  private _authService: AuthService = inject(AuthService);

  // -----------------------------------------------------------------------------------------------------
  // @ Variables
  // -----------------------------------------------------------------------------------------------------
  headerConfig: GenericHeaderConfig = {
    title: 'users.add.title',
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
        role: new FormControl(null, Validators.required),
        city: new FormControl(null, Validators.required),
        region: new FormControl(null, Validators.required),
        secondaryRoles: this._formBuilder.array([]),
        programs: new FormControl([] as ProgramOption[]),
        isActive: new FormControl(true),
        isTemporalPasswordActived: new FormControl(true),
        emailConfirmed: new FormControl(false),
      },
      {
        validators: this.onPassword.bind(this),
      }
    ),
    submitButtonShow: true,
    submitButtonText: 'users.add.submit',
    submitDisabled: true,
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
  listPrograms: ProgramOption[] = [];
  listCities: City[] = [];
  listRegions: Region[] = [];
  compareById = compareById;

  /** Idioma activo de la UI (es/en) para mostrar nombres de roles en el idioma correcto. */
  currentLang = 'es';

  isLoading = false;

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

  /** Devuelve el FormArray de roles secundarios. */
  get secondaryRolesArray(): FormArray {
    return this.headerConfig.formGroup.get('secondaryRoles') as FormArray;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ ngOnInit / ngOnDestroy
  // -----------------------------------------------------------------------------------------------------
  /** Inicializa el formulario: carga roles y programas del resolver, sincroniza username con email y muestra/oculta Auspiciador según rol primario. */
  ngOnInit() {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      this.listRoles = resolvedData.roles ?? [];
      this.listPrograms = resolvedData.programs ?? [];
      this.listCities = resolvedData.cities ?? [];
      this.listRegions = resolvedData.regions ?? [];
      this._changeDetectorRef.markForCheck();
    }

    this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
    this.headerConfig.formGroup.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this.headerConfig.submitDisabled = this.headerConfig.formGroup.invalid;
      this._changeDetectorRef.markForCheck();
    });

    // Suscribirse a los cambios del campo email para sincronizar con username
    this.headerConfig.formGroup.get('email').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
      this.headerConfig.formGroup.get('username').setValue(value);
    });

    // Sincronizar idioma de la UI para mostrar nombres de roles (displayName vs displayNameEN)
    this.currentLang = this._translocoService.getActiveLang() ?? 'es';
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang) => {
      this.currentLang = lang ?? 'es';
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

  /** Llamado por el botón Submit del header; envía el formulario o marca errores. */
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

  /** Crea un FormGroup para una fila de rol secundario (rol, vigencia desde/hasta) con validador de rango de fechas. */
  createSecondaryRoleGroup(
    role?: DTORole | null,
    validFrom?: string | Date | null,
    validTo?: string | Date | null,
  ): FormGroup {
    const fromVal = toIsoDateString(validFrom);
    const toVal = toIsoDateString(validTo);
    return this._formBuilder.group(
      {
        role: new FormControl(role ?? null),
        validFrom: new FormControl(fromVal),
        validTo: new FormControl(toVal),
      },
      {
        validators: (g: AbstractControl) => {
          const from = g.get('validFrom')?.value;
          const to = g.get('validTo')?.value;
          if (from && to && new Date(to) <= new Date(from)) return VALIDATION_ERRORS.DATE_RANGE;
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
    this.secondaryRolesTableConfig.dataSource.data = this.secondaryRolesArray.controls.map((g, i) => {
      const role = g.get('role')?.value as DTORole | null;
      const roleName = this.currentLang === 'es' ? (role?.displayName ?? '') : (role?.displayNameEN ?? '');
      return {
        id: i,
        roleName,
        validFrom: formatDateShort(g.get('validFrom')?.value),
        validTo: formatDateShort(g.get('validTo')?.value),
      };
    }) as SecondaryRoleTableRow[];
    this._changeDetectorRef.markForCheck();
  }

  /** Abre el modal para elegir un rol secundario; pasa lista de roles, rol primario y IDs ya usados para excluirlos. Al confirmar, añade la fila y sincroniza la tabla. */
  openAddSecondaryRoleModal(): void {
    // Obtener el rol primario para excluirlo del backend
    const role = this.headerConfig.formGroup.get('role')?.value as DTORole | null;
    const primaryRoleId = role?.id ? String(role.id) : undefined;

    // Obtener los IDs de roles secundarios ya asignados para excluirlos del backend
    const secondaryRoles = this.headerConfig.formGroup.get('secondaryRoles') as FormArray | null;
    const existingSecondaryRoleIds = (secondaryRoles?.controls ?? [])
      .map((c) => (c.get('role')?.value as DTORole)?.id)
      .filter((id) => id != null)
      .map((id) => String(id));

    // Llamar al backend para obtener roles ya filtrados
    this._usersService.getAvailableSecondaryRoles(primaryRoleId, existingSecondaryRoleIds).subscribe({
      next: (response) => {
        const availableRoles = response?.body?.data ?? [];
        const modalData: AddSecondaryRoleModalData = {
          listRoles: availableRoles,
        };
        const dialogRef = this._matDialog.open(AddSecondaryRoleModalComponent, {
          width: '500px',
          maxWidth: '90vw',
          data: modalData,
        });
        dialogRef.afterClosed().subscribe((result: AddSecondaryRoleModalResult) => {
          if (result?.role) {
            this.secondaryRolesArray.push(this.createSecondaryRoleGroup(result.role, result.validFrom, result.validTo));
            this.syncSecondaryRolesTableData();
          }
        });
      },
      error: (error) => {
        console.error('Error loading available secondary roles:', error);
      }
    });
  }

  /** Validador del grupo: verifica que contraseña y confirmación coincidan. */
  onPassword(formGroup: FormGroup) {
    const { value: password } = formGroup.get('currentPassword');
    const { value: confirmPassword } = formGroup.get('newPassword');
    return password === confirmPassword ? null : VALIDATION_ERRORS.PASSWORD_NOT_MATCH;
  }

  /** Validador del grupo: verifica que username y email coincidan. */
  onUserName(formGroup: FormGroup) {
    const { value: username } = formGroup.get('username');
    const { value: email } = formGroup.get('email');
    return username === email ? null : { emailNotMatch: true };
  }

  /** Valida datos del formulario, construye RequestUser y llama al servicio para crear el usuario; al terminar navega a la lista. */
  submitForm(form: AddUserFormValue) {
    this.isLoading = true;
    const requestParameters: QueryParameters = {
      agencyId: this._authService.getAgencyId(),
    };

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
        if (result?.status === 200) {
          this._changeDetectorRef.markForCheck();
        }
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        this.onBack();
      },
    });
  }

  /** Sustituye la URL de la imagen por la de avatar por defecto cuando la carga falla. */
  handleMissingImage(event: Event) {
    this.imageURL = 'assets/images/avatars/profile.png';
  }

  /** Carga las regiones por ciudad y actualiza el control de región; al cambiar ciudad se limpia o asigna la única región si hay una sola. */
  getRegionsByCityId(city: City, target: string): void {
    if (!city) return;
    const queryParameters: QueryParameters = { cityId: city.id };
    this._geoService.getRegionsByCityId(queryParameters).subscribe({
      next: (response) => {
        if (response?.body?.data) {
          if (target === 'region') {
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
        }
        this._changeDetectorRef.markForCheck();
      },
      error: () => {
        this._changeDetectorRef.markForCheck();
      },
    });
  }
}
