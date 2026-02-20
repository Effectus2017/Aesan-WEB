import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import _ from 'lodash';
import { UsersService } from '../../../../shared/services/users.service';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import {
    AddSecondaryRoleModalResult,
    AgencyListItem,
    DTORole,
    RequestUser,
    SecondaryRoleFormRow,
    SecondaryRoleFromUserRow,
    SecondaryRoleInput,
    UserSecondaryRoleStub,
} from '../users.types';
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
import { compare, compareById, compareString, formatDateShort, handleFormControls, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';
import { isAdminRole } from 'app/shared/constants/role-keys';
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
import { AddSecondaryRoleModalComponent } from '../add-secondary-role-modal/add-secondary-role-modal.component';
import { DeletePermissionModalComponent } from '../delete-permission-modal/delete-permission-modal.component';
import { UpdatePasswordModalComponent } from '../update-password-modal/update-password-modal.component';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { VALIDATION_ERRORS } from 'app/shared/constants/validation-errors';

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
  // -----------------------------------------------------------------------------------------------------
  // @ Subject de desuscripción
  // -----------------------------------------------------------------------------------------------------
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // -----------------------------------------------------------------------------------------------------
  // @ Inyecciones privadas
  // -----------------------------------------------------------------------------------------------------
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

  // -----------------------------------------------------------------------------------------------------
  // @ Variables
  // -----------------------------------------------------------------------------------------------------
  /** Email original para excluir de la validación en edición */
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
        programs: new FormControl([] as { id: number; name: string }[]),
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
    dataSource: new MatTableDataSource<{ id: number; roleName: string; comment: string; validFrom: string; validTo: string }>(),
    columnsSchema: SECONDARY_ROLES_COLUMNS_SCHEMA,
    displayedColumns: SECONDARY_ROLES_COLUMNS_SCHEMA.map((col) => (Array.isArray(col.key) ? col.key[0] : col.key)),
    handler: null as any,
    showPaginator: false,
    fullScreen: false,
  };

  imageURL: string;
  fileToUpload: File = null;
  fileResponse: FileResponse;

  id?: string = null;
  user?: any;

  listRoles: any[] = [];
  listAgencies: any[] = [];
  listPrograms: { id: number; name: string }[] = [];

  userRole: string = null;

  /** Nombres de roles AESAN (desde API). Si el rol primario está aquí, el auspiciador es siempre AESAN y se oculta el input. */
  aesanRoleNames: string[] = [];
  /** Agencia AESAN en listAgencies (por nombre 'AESAN'). */
  aesanAgency: { id: number; name: string } | null = null;
  /** true = mostrar campo Auspiciador (roles de agencia); false = ocultar y usar siempre AESAN. */
  showAgencyField = true;

  compare = compare;
  compareById = compareById;
  compareString = compareString;

  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Getters
  // -----------------------------------------------------------------------------------------------------
  /** Indica si el usuario actual tiene rol de administrador (administrator o super_administrator). */
  get isAdminUser(): boolean {
    return isAdminRole(this.userRole);
  }

  /** Devuelve el handler de la tabla de roles secundarios (acciones por fila, p. ej. eliminar). */
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

  /** Devuelve el FormArray de roles secundarios del formulario. */
  get secondaryRolesArray(): FormArray {
    return this.headerConfig.formGroup.get('secondaryRoles') as FormArray;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ ngOnInit / ngOnDestroy
  // -----------------------------------------------------------------------------------------------------
  /** Inicializa el componente: carga usuario, roles, agencias y programas del resolver; rellena el formulario y suscribe cambios de rol primario y estado. */
  ngOnInit() {
    this.userRole = this._authService.getUserRole();
    const isAdmin = isAdminRole(this.userRole);
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
      this.listRoles = resolvedData.roles?.data ?? [];
      this.listAgencies = resolvedData.agencies?.data ?? [];
      this.listPrograms = resolvedData.programs?.data ?? [];
      this._resolveAesanAgency();

      // Configurar permisos si existen
      if (resolvedData.permissions) {
        this.tableConfig.dataSource.data = resolvedData.permissions.data ?? [];
        this.tableConfig.length = resolvedData.permissions.count ?? 0;
      }

      // Configurar el formulario con los datos del usuario
      this.onSetForm(this.user);

      this._usersService.getAesanRoleNames().pipe(takeUntil(this._unsubscribeAll)).subscribe((names) => {
        this.aesanRoleNames = names ?? [];
        this._applyAgencyVisibilityByPrimaryRole();
        this._changeDetectorRef.markForCheck();
      });

      // Mostrar/ocultar campo Auspiciador según rol primario (AESAN vs agencia)
      this.headerConfig.formGroup.get('primaryRole').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
        this._applyAgencyVisibilityByPrimaryRole();
        this._changeDetectorRef.markForCheck();
      });

      // Actualizar vista del header cuando cambie la validez del formulario (p. ej. validadores asíncronos)
      this.headerConfig.formGroup.statusChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });

      this._changeDetectorRef.markForCheck();
    }

  }

  /** Cancela suscripciones al destruir el componente. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Funciones On (componentes genéricos)
  // -----------------------------------------------------------------------------------------------------
  /** Ejecuta la acción del menú de configuración del header (forzar contraseña, actualizar contraseña, agregar rol secundario). */
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

  /** Valida el formulario y llama a onUpdate con el valor actual, o muestra diálogo si el formulario es inválido. */
  onSave(): void {
    this._applyAgencyVisibilityByPrimaryRole();
    if (this.headerConfig.formGroup.valid) {
      this.onUpdate(this.headerConfig.formGroup.value);
    } else {
      this.headerConfig.formGroup.markAllAsTouched();
      this._fuseConfirmationService.open({
        title: this._translocoService.translate('users.edit.update.invalidForm.title'),
        message: this._translocoService.translate('users.edit.update.invalidForm.message'),
        icon: {
          show: true,
          name: 'heroicons_outline:exclamation-triangle',
          color: 'warn',
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
  }

  /** Abre el modal de agregar rol secundario (acción personalizada del menú). */
  onCustom(): void {
    this.openAddSecondaryRoleModal();
  }

  /** Navega a la lista de usuarios sin guardar. */
  onCancel(): void {
    this._customRouter.navigate(['users']);
  }

  /** Abre el modal para agregar permiso al usuario. */
  onAdd(): void {
    this.openAddPermissionModal();
  }

  /** Gestiona las acciones de la tabla de permisos (p. ej. eliminar). */
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

  /** Busca el permiso por ID en la tabla y abre el modal de eliminar permiso. */
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

  /** Ejecuta la acción del menú añadir de la tabla (agregar permiso). */
  onAddMenuAction(menuItemId: string): void {
    if (menuItemId === 'add') {
      this.openAddPermissionModal();
    }
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

  /** Sube el archivo como avatar del usuario, actualiza el backend y muestra diálogo de éxito o error. */
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

  /** Muestra confirmación y, si el usuario acepta, fuerza el restablecimiento de contraseña en el backend. */
  onForcePassword() {
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

  /** Envía la petición de restablecer contraseña y recarga el usuario; muestra diálogo de éxito o error. */
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

  /** Envía el cambio de contraseña al backend y recarga el usuario; muestra diálogo de éxito o error. */
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

  // -----------------------------------------------------------------------------------------------------
  // @ Otras funciones públicas
  // -----------------------------------------------------------------------------------------------------
  /** Muestra diálogo de confirmación y, si el usuario confirma, elimina el rol secundario en el índice dado y sincroniza la tabla. */
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

  /** Validador del grupo: verifica que contraseña y confirmación coincidan. */
  onPassword(formGroup: FormGroup) {
    const { value: password } = formGroup.get('currentPassword');
    const { value: confirmPassword } = formGroup.get('newPassword');
    return password === confirmPassword ? null : VALIDATION_ERRORS.PASSWORD_NOT_MATCH;
  }

  /** Validador del grupo: verifica que userName y email coincidan. */
  onUserName(formGroup: FormGroup) {
    const { value: userName } = formGroup.get('userName');
    const { value: email } = formGroup.get('email');
    return userName === email ? null : { emailNotMatch: true };
  }

  /** Crea un FormGroup para una fila de rol secundario (rol, comentario, vigencia desde/hasta) con validador de rango de fechas. */
  createSecondaryRoleGroup(role?: DTORole | null, validFrom?: string | Date | null, validTo?: string | Date | null, comment?: string | null): FormGroup {
    const fromVal = validFrom ? (typeof validFrom === 'string' ? validFrom : (validFrom as Date).toISOString().slice(0, 10)) : null;
    const toVal = validTo ? (typeof validTo === 'string' ? validTo : (validTo as Date).toISOString().slice(0, 10)) : null;
    return this._formBuilder.group({
      role: new FormControl(role ?? null),
      comment: new FormControl(comment ?? null),
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
      roleName: (g.get('role')?.value as { id: string; name: string } | null)?.name ?? '',
      comment: String(g.get('comment')?.value ?? '').trim(),
      validFrom: formatDateShort(g.get('validFrom')?.value),
      validTo: formatDateShort(g.get('validTo')?.value),
    }));
    this._changeDetectorRef.markForCheck();
  }

  /** Rellena el formulario con los datos del usuario (param), incluyendo roles secundarios y validador de email. */
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
    const userPrograms = this.user.programs ?? [];
    const selectedPrograms = Array.isArray(userPrograms) && userPrograms.length > 0
      ? userPrograms.map((p: { id: number; name?: string }) => this.listPrograms?.find((lp: { id: number }) => lp.id === p.id) ?? { id: p.id, name: p.name ?? '' }).filter(Boolean)
      : (this.user.programId != null
          ? [this.listPrograms?.find((p: { id: number }) => p.id === this.user.programId) ?? { id: this.user.programId, name: this.user.programName ?? this.user.program?.name ?? '' }].filter(Boolean)
          : []);
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
      programs: selectedPrograms ?? [],
    });
    const secondaryRows = this.getSecondaryRolesFromUser();
    this.secondaryRolesArray.clear();
    secondaryRows.forEach((row) => {
      this.secondaryRolesArray.push(this.createSecondaryRoleGroup(row.role, row.validFrom, row.validTo, row.comment));
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

  /** Obtiene el rol primario del usuario actual a partir de primaryRoleName o roles/role. */
  private getPrimaryRoleFromUser(): DTORole | null {
    const primaryName = this.user?.primaryRoleName;
    if (primaryName) {
      const found = this.listRoles?.find((r: DTORole) => r.name === primaryName);
      return found ?? null;
    }
    const roleNames = this.user?.roles ?? (this.user?.role ? [this.user.role.name] : []);
    const first = roleNames?.[0];
    if (!first) return null;
    return this.listRoles?.find((r: DTORole) => r.name === first) ?? null;
  }

  /** Convierte los roles secundarios del usuario (user.secondaryRoles) en filas con rol, comentario y fechas. */
  private getSecondaryRolesFromUser(): SecondaryRoleFromUserRow[] {
    const list = this.user?.secondaryRoles ?? [];
    if (!Array.isArray(list) || !list.length) return [];
    return list.map((s: UserSecondaryRoleStub) => {
      const role = s.roleName ? (this.listRoles?.find((r: DTORole) => r.name === s.roleName) ?? null) : null;
      const comment = s.comment ?? null;
      const from = s.validFrom ?? null;
      const to = s.validTo ?? null;
      return { role, comment, validFrom: from, validTo: to };
    });
  }

  /** Recarga el usuario actual desde el backend por ID. */
  getById() {
    const requestParameters: QueryParameters = {
      userId: this.id,
    };

    this._usersService.getUserByIdWithSP(requestParameters).subscribe();
  }

  /** Abre el modal para elegir un rol secundario; pasa lista de roles, rol primario y nombres ya usados. Al confirmar, añade la fila, sincroniza la tabla y guarda en backend. */
  openAddSecondaryRoleModal(): void {
    const formGroup = this.headerConfig.formGroup;
    
    // Obtener el rol primario para excluirlo del backend
    const primaryRole = formGroup.get('primaryRole')?.value as DTORole | null;
    const primaryRoleId = primaryRole?.id ? String(primaryRole.id) : undefined;
    
    // Obtener los IDs de roles secundarios ya asignados para excluirlos del backend
    const secondaryRoles = formGroup.get('secondaryRoles') as FormArray | null;
    const existingSecondaryRoleIds = (secondaryRoles?.controls ?? [])
      .map((c) => (c.get('role')?.value as DTORole)?.id)
      .filter((id) => id != null)
      .map((id) => String(id));
    
    // Llamar al backend para obtener roles ya filtrados
    this._usersService.getAvailableSecondaryRoles(primaryRoleId, existingSecondaryRoleIds).subscribe({
      next: (response) => {
        const availableRoles = response?.body?.data ?? [];
        const dialogRef = this._matDialog.open(AddSecondaryRoleModalComponent, {
          width: '500px',
          maxWidth: '90vw',
          data: {
            listRoles: availableRoles,
          },
        });
        dialogRef.afterClosed().subscribe((result: AddSecondaryRoleModalResult) => {
          if (result?.role) {
            this.secondaryRolesArray.push(this.createSecondaryRoleGroup(result.role, result.validFrom, result.validTo, result.comment ?? null));
            this.syncSecondaryRolesTableData();
            this.saveSecondaryRolesToBackend();
          }
        });
      },
      error: (error) => {
        console.error('Error loading available secondary roles:', error);
      }
    });
  }

  /** Habilita o deshabilita el ítem del menú "Agregar rol secundario". */
  private setAddSecondaryRoleMenuItemDisabled(disabled: boolean): void {
    const item = this.headerConfig.settingsMenuItems?.find((i) => i.id === 'add-secondary-role');
    if (item) {
      item.disabled = disabled;
    }
  }

  /** Envía al backend la actualización del usuario con los roles secundarios actuales; en error revierte la última fila añadida. */
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
        primaryRoleControl?.setErrors(VALIDATION_ERRORS.REQUIRED);
        primaryRoleControl?.markAsTouched();
        this.revertLastSecondaryRole();
        return;
      }
    }
    const secondaryRows = (form.secondaryRoles ?? []) as SecondaryRoleFormRow[];
    let secondaryRolesPayload: SecondaryRoleInput[] | undefined = secondaryRows
      .filter((row) => row?.role?.name)
      .map((row) => ({
        roleName: row.role!.name ?? '',
        comment: row.comment != null && String(row.comment).trim() !== '' ? String(row.comment).trim() : undefined,
        validFrom: typeof row.validFrom === 'string' ? row.validFrom.slice(0, 10) : (row.validFrom ? new Date(row.validFrom).toISOString().slice(0, 10) : ''),
        validTo: typeof row.validTo === 'string' ? row.validTo.slice(0, 10) : (row.validTo ? new Date(row.validTo).toISOString().slice(0, 10) : ''),
      }))
      .filter((s) => s.validFrom && s.validTo);
    if (secondaryRolesPayload.length === 0) secondaryRolesPayload = undefined;

    const requestParameters: QueryParameters = { currentUserId: loggedInUserId };
    const agencyId = this._isPrimaryRoleAesan() && this.aesanAgency
      ? this.aesanAgency.id
      : (form.agency?.id ?? this.user.agency?.id);
    const programsListSec = (form.programs ?? []) as { id: number; name: string }[];
    const programIdsSec = programsListSec?.length ? programsListSec.map((p) => p.id).filter((id) => id > 0) : undefined;
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
      programIds: programIdsSec?.length ? programIdsSec : undefined,
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

  /** Elimina la última fila del FormArray de roles secundarios y sincroniza la tabla (usado al fallar guardado). */
  private revertLastSecondaryRole(): void {
    if (this.secondaryRolesArray.length > 0) {
      this.secondaryRolesArray.removeAt(this.secondaryRolesArray.length - 1);
      this.syncSecondaryRolesTableData();
    }
  }

  /** Valida el formulario, construye RequestUser y llama al servicio para actualizar el usuario; muestra diálogo de éxito o error. */
  onUpdate(form: any) {
    // si correo es null, no se puede actualizar
    if (isNullOrUndefinedEmptyStringNullArray(form.email) && isNullOrUndefinedEmptyStringNullArray(this.user.email)) {
      this.headerConfig.formGroup.get('email').setErrors(VALIDATION_ERRORS.REQUIRED);
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
            .filter((s: UserSecondaryRoleStub) => s.roleName && s.validFrom && s.validTo)
            .map((s: SecondaryRoleInput) => ({
              roleName: s.roleName,
              comment: s.comment != null && String(s.comment).trim() !== '' ? String(s.comment).trim() : undefined,
              validFrom: typeof s.validFrom === 'string' ? s.validFrom.slice(0, 10) : '',
              validTo: typeof s.validTo === 'string' ? s.validTo.slice(0, 10) : '',
            }))
        : undefined;
    } else {
      const primaryRole = form.primaryRole;
      primaryRoleName = primaryRole?.name ?? (typeof primaryRole === 'string' ? primaryRole : '');
      if (!primaryRoleName) {
        primaryRoleControl?.setErrors(VALIDATION_ERRORS.REQUIRED);
        primaryRoleControl?.markAsTouched();
        return;
      }
      const secondaryRows = (form.secondaryRoles ?? []) as SecondaryRoleFormRow[];
      secondaryRolesPayload = secondaryRows
        .filter((row) => row?.role?.name)
        .map((row) => ({
          roleName: row.role!.name,
          comment: row.comment != null && String(row.comment).trim() !== '' ? String(row.comment).trim() : undefined,
          validFrom: typeof row.validFrom === 'string' ? row.validFrom.slice(0, 10) : (row.validFrom ? new Date(row.validFrom).toISOString().slice(0, 10) : ''),
          validTo: typeof row.validTo === 'string' ? row.validTo.slice(0, 10) : (row.validTo ? new Date(row.validTo).toISOString().slice(0, 10) : ''),
        }))
        .filter((s) => s.validFrom && s.validTo);
      if (secondaryRolesPayload.length === 0) secondaryRolesPayload = undefined;
    }

    const requestParameters: QueryParameters = {
      currentUserId: loggedInUserId,
    };

    const agencyId = this._isPrimaryRoleAesan() && this.aesanAgency
      ? this.aesanAgency.id
      : (form.agency?.id ?? this.user.agency?.id);
    const programsListForUpdate = (form.programs ?? []) as { id: number; name: string }[];
    const programIdsForUpdate = programsListForUpdate?.length ? programsListForUpdate.map((p) => p.id).filter((id) => id > 0) : undefined;
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
      programIds: programIdsForUpdate?.length ? programIdsForUpdate : undefined,
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

  /** Sustituye la URL de la imagen por la de avatar por defecto cuando la carga falla. */
  handleMissingImage(event: Event) {
    this.imageURL = 'assets/images/avatars/profile.png';
  }

  /** Deshabilita los controles editables del formulario; si es el propio perfil, deshabilita también rol primario y secundarios. */
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

  /** Abre el modal para agregar permisos al usuario; al cerrar con éxito recarga la lista de permisos. */
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

  /** Abre el modal para actualizar contraseña; al cerrar con éxito recarga los datos del usuario. */
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

  /** Abre el modal para eliminar el permiso indicado; al cerrar con éxito recarga la lista de permisos. */
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

  /** Carga los permisos del usuario desde el backend y actualiza la tabla de permisos. */
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
  // @ Funciones privadas
  // -----------------------------------------------------------------------------------------------------
  /** Busca en listAgencies la agencia con nombre 'AESAN' y la asigna a aesanAgency. */
  private _resolveAesanAgency(): void {
    const found = (this.listAgencies as AgencyListItem[]).find(
      (a) => (a.name ?? a.Name ?? '') === 'AESAN'
    );
    this.aesanAgency = found ? { id: found.id ?? 0, name: found.name ?? found.Name ?? 'AESAN' } : null;
  }

  /** Indica si el rol primario seleccionado es uno de los roles AESAN (aesanRoleNames). */
  private _isPrimaryRoleAesan(): boolean {
    const role = this.headerConfig.formGroup.get('primaryRole')?.value;
    const name = (role?.name ?? role?.Name ?? '').trim();
    if (name.length === 0) return false;
    const nameLower = name.toLowerCase();
    return this.aesanRoleNames.some((n) => (n ?? '').trim().toLowerCase() === nameLower);
  }

  /** Muestra u oculta el campo Auspiciador y configura validación según si el rol primario es AESAN; si es AESAN, fija la agencia y quita validación. */
  private _applyAgencyVisibilityByPrimaryRole(): void {
    const agencyControl = this.headerConfig.formGroup.get('agency');
    if (!agencyControl) return;
    // Mientras no tengamos la lista de roles AESAN, no exigir auspiciante (evita validación incorrecta al cargar)
    if (this.aesanRoleNames.length === 0) {
      agencyControl.clearValidators();
      agencyControl.setErrors(null);
      agencyControl.updateValueAndValidity({ emitEvent: false });
      this.headerConfig.formGroup.updateValueAndValidity({ emitEvent: false });
      return;
    }
    const isAesan = this._isPrimaryRoleAesan();
    this.showAgencyField = !isAesan;
    if (isAesan) {
      // Rol AESAN: quitar siempre la validación de auspiciante y limpiar errores
      agencyControl.clearValidators();
      agencyControl.setErrors(null);
      if (this.aesanAgency) {
        agencyControl.setValue(this.aesanAgency);
      }
      agencyControl.updateValueAndValidity({ emitEvent: false });
    } else {
      agencyControl.setValidators(Validators.required);
      agencyControl.updateValueAndValidity({ emitEvent: false });
    }
    this.headerConfig.formGroup.updateValueAndValidity({ emitEvent: false });
  }
}
