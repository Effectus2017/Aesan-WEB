import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import _ from 'lodash';
import { UsersService } from '../../../../shared/services/users.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RequestUser } from '../users.types';
import { UploadService } from 'app/shared/services/upload.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { compareById, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoService } from '@ngneat/transloco';
import { MatDialog } from '@angular/material/dialog';
import { UpdatePasswordModalComponent } from '../../../../modules/admin-portal/users/update-password-modal/update-password-modal.component';
import { UserService } from 'app/shared/services/user.service';
import { emailExistsValidator } from 'app/shared/validators/email-exists.validator';
import { VALIDATION_ERRORS } from 'app/shared/constants/validation-errors';

@Component({
  selector: 'app-users-edit',
  templateUrl: './edit.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
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
  ],
})
export class UsersEditComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
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
  private _matDialog: MatDialog = inject(MatDialog);
  private _userService: UserService = inject(UserService);

  // Email original para excluir de la validación en edición
  originalEmail: string = '';

  headerConfig: GenericHeaderConfig = {
    title: 'users.edit.title',
    formGroup: this._formBuilder.group({
        email: new FormControl({ value: null, readonly: false }, [Validators.required, Validators.email], [emailExistsValidator(this._userService, this.originalEmail)]),
        firstName: new FormControl(null, Validators.required),
        middleName: new FormControl(null),
        fatherLastName: new FormControl(null, Validators.required),
        motherLastName: new FormControl(null),
        role: new FormControl({ value: null, disabled: true }), // Rol readonly en perfil
        agency: new FormControl(null),
    }),
    saveButtonShow: true,
    saveButtonText: 'users.edit.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'users.edit.buttons.cancel',
    settingsButtonShow: true,
    settingsMenuItems: [
      {
        id: 'update-password',
        label: 'users.edit.buttons.update-password',
        icon: 'heroicons_solid:key',
      },
    ],
  };

  imageURL: string;
  fileToUpload: File = null;
  fileResponse: FileResponse;

  id?: string = null;
  user?: any;

  listRoles: any[] = [];

  compareById = compareById;

  constructor() {}

  ngOnInit() {
    // Obtener datos del resolver
    const resolvedData = this.route.snapshot.data['data'];

    if (resolvedData) {
      this.user = resolvedData.user;
      this.listRoles = resolvedData.roles?.data ?? [];
      this.id = this.user.id;

      // Configurar el formulario con los datos del usuario
      this.onSetForm(this.user);

      this._changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
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

    this.headerConfig.formGroup.patchValue({
      email: this.user.email,
      firstName: this.user.firstName,
      middleName: this.user.middleName,
      fatherLastName: this.user.fatherLastName,
      motherLastName: this.user.motherLastName,
      role: this.user.role,
      agency: this.user.agency,
    });

    // Actualizar el validador de email con el email original
    const emailControl = this.headerConfig.formGroup.get('email');
    if (emailControl) {
      emailControl.clearAsyncValidators();
      emailControl.setAsyncValidators([emailExistsValidator(this._userService, this.originalEmail)]);
      emailControl.updateValueAndValidity();
    }
  }

  // Método para manejar acciones del menú de settings
  onSettingsMenuAction(menuItemId: string): void {
    switch (menuItemId) {
      case 'update-password':
        this.openUpdatePasswordModal();
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

  // Para cuando se cancela el usuario. cancel button
  onCancel(): void {
    // Navegar al dashboard o página anterior
    this._customRouter.navigate(['dashboard']);
  }

  // Para cuando se actualiza el usuario, excepto la contraseña
  onUpdate(form: any) {
    // si correo es null, no se puede actualizar
    if (isNullOrUndefinedEmptyStringNullArray(form.email) && isNullOrUndefinedEmptyStringNullArray(this.user.email)) {
      this.headerConfig.formGroup.get('email').setErrors(VALIDATION_ERRORS.REQUIRED);
      this.headerConfig.formGroup.get('email').markAsTouched();
      return;
    }

    // Obtener el rol actual del usuario (ya que está deshabilitado)
    const loggedInUserId = this._authService.getUserId();
    const roleName = this.user.roles?.[0] || this.user.role?.name;

    const requestParameters: QueryParameters = {
      currentUserId: loggedInUserId,
    };

    const _model: RequestUser = {
      id: this.id,
      firstName: isNullOrUndefinedEmptyStringNullArray(form.firstName) ? null : form.firstName,
      middleName: isNullOrUndefinedEmptyStringNullArray(form.middleName) ? null : form.middleName,
      fatherLastName: isNullOrUndefinedEmptyStringNullArray(form.fatherLastName) ? null : form.fatherLastName,
      motherLastName: isNullOrUndefinedEmptyStringNullArray(form.motherLastName) ? null : form.motherLastName,
      email: isNullOrUndefinedEmptyStringNullArray(form.email) ? this.user.email : form.email,
      userName: this.user.userName,
      imageURL: this.imageURL,
      roles: [roleName],
      agencyId: this.user.agency?.id,
      // No incluir campos de estado en perfil de usuario
      isActive: this.user.isActive,
      isTemporalPasswordActived: this.user.isTemporalPasswordActived,
      emailConfirmed: this.user.emailConfirmed,
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
      error: (error) => {
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
            error: (error) => {
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
        userRole: this._authService.getUserRole(),
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
}

