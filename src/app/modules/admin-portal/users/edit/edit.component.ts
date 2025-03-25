import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import _ from 'lodash';
import { UsersService } from '../../../../shared/services/users.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ChangePassword, RequestUser } from '../users.types';
import { UploadService } from 'app/shared/services/upload.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { handleFormControls, isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { TranslocoModule } from '@ngneat/transloco';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-users-edit',
  templateUrl: './edit.component.html',
  standalone: true,
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
    TranslocoModule,
    GenericHeaderComponent,
  ],
})
export class UsersEditComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private route: ActivatedRoute = inject(ActivatedRoute);
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _usersService: UsersService = inject(UsersService);
  private _agencyService: AgencyService = inject(AgencyService);
  private _uploadService: UploadService = inject(UploadService);
  private _authService: AuthService = inject(AuthService);
  private _customRouter: CustomRouterService = inject(CustomRouterService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  headerConfig: GenericHeaderConfig = {
    title: 'users.edit.title',
    saveButtonShow: true,
    saveButtonText: 'users.edit.buttons.update',
    submitButtonShow: true,
    submitButtonText: 'users.edit.buttons.update-password',
    submitDisabled: true,
    customButtonShow: true,
    customButtonText: 'users.edit.buttons.force-password',
    customButtonColor: 'primary',
  };

//   formRoot: UntypedFormGroup;
  imageURL: string;
  fileToUpload: File = null;
  fileResponse: FileResponse;

  id?: string = null;
  user?: any;

  listRoles: any[] = [];
  listAgencies: any[] = [];

  userRole: string = null;

  constructor() {
    this.userRole = this._authService.getUserRole();
  }

  ngOnInit() {

    this.headerConfig.formGroup = this._formBuilder.group({
      datosPersonales: this._formBuilder.group({
        email: new FormControl({ value: null, readonly: false }, [Validators.required, Validators.email]),
        firstName: new FormControl(null, Validators.required),
        middleName: new FormControl(null),
        fatherLastName: new FormControl(null, Validators.required),
        motherLastName: new FormControl(null),
        role: new FormControl(null, Validators.required),
        agency: new FormControl(null, Validators.required),
      }),
      password: this._formBuilder.group(
        {
          currentPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          newPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
        }
      ),
    });

    this._usersService.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.onSetForm(result.body);
        // Mark for check
        this._changeDetectorRef.markForCheck();
      }
    });

    // Get the accountings
    this._usersService.roles$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.listRoles = result.body.data;

      if (this.user) {

        // bsucar el rol en la lista de roles
        const role = this.listRoles.find((role: any) => role.name === this.user.roles[0]);

        this.headerConfig.formGroup.controls.datosPersonales.patchValue({
          role: role,
        });
      }

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

    this._agencyService.agenciesList$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
        this.listAgencies = result.body;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    // Suscribirse a los cambios del formulario para actualizar el estado del botón
    this.headerConfig.formGroup.get('password').valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        // Actualizar el estado del botón basado en la validación del formulario
        this.headerConfig.submitDisabled = this.headerConfig.formGroup.get('password').invalid;
        this._changeDetectorRef.markForCheck();
      });
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
    this.imageURL = param.imageURL;

    this.headerConfig.formGroup.controls.datosPersonales.patchValue({
      email: this.user.email,
      firstName: this.user.firstName,
      middleName: this.user.middleName,
      fatherLastName: this.user.fatherLastName,
      motherLastName: this.user.motherLastName,
    });

     this.disableEditableFormControls();
  }

  getWithQueryString() {
    this.route.paramMap.subscribe((params) => {
      if (params.get('id')) {
        if (!isNullOrUndefinedEmptyStringNullArray(params.get('id'))) {
          this.id = params.get('id');
          this.getById();
        }
      }
    });
  }

  getById() {
    const requestParameters: QueryParameters = {
      userId: this.id,
    };

    this._usersService.getUserByIdFromDb(requestParameters).subscribe();
  }

  // Para cuando se actualiza la contraseña. submit button
  onSubmit() {
    if (this.headerConfig.formGroup.controls.password.valid) {
      this.onUpdatePassword(this.headerConfig.formGroup.value.password);
    } else {
      this.headerConfig.formGroup.get('password').get('currentPassword').setErrors({ passwordNotMatch: true });
      this.headerConfig.formGroup.get('password').get('newPassword').setErrors({ passwordNotMatch: true });
      this.headerConfig.formGroup.markAllAsTouched();
    }
  }

  // Para cuando se actualiza el usuario. save button
  onSave(): void {
    if (this.headerConfig.formGroup.controls.datosPersonales.valid) {
        this.onUpdate(this.headerConfig.formGroup.value.datosPersonales);
      } else {
        this.headerConfig.formGroup.get('password').get('currentPassword').setErrors({ passwordNotMatch: true });
        this.headerConfig.formGroup.get('password').get('newPassword').setErrors({ passwordNotMatch: true });
        this.headerConfig.formGroup.markAllAsTouched();
      }
  }

  // Para cuando se cancela el usuario. cancel button
  onCancel(): void {
    this._customRouter.navigate(['users']);
  }

  // Para cuando se actualiza el usuario, excepto la contraseña
  onUpdate(form: any) {
    const requestParameters: QueryParameters = {};

    // si correo es null, no se puede actualizar
    if (isNullOrUndefinedEmptyStringNullArray(form.email) && isNullOrUndefinedEmptyStringNullArray(this.user.email)) {
      this.headerConfig.formGroup.get('datosPersonales').get('email').setErrors({ required: true });
      this.headerConfig.formGroup.get('datosPersonales').get('email').markAsTouched();
      return;
    }

    // si rol es null, no se puede actualizar
    if (isNullOrUndefinedEmptyStringNullArray(form.role.name)) {
      this.headerConfig.formGroup.get('datosPersonales').get('role').setErrors({ required: true });
      this.headerConfig.formGroup.get('datosPersonales').get('role').markAsTouched();
      return;
    }

    const _model: RequestUser = {
      id: this.id,
      firstName: isNullOrUndefinedEmptyStringNullArray(form.firstName) ? null : form.firstName,
      middleName: isNullOrUndefinedEmptyStringNullArray(form.middleName) ? null : form.middleName,
      fatherLastName: isNullOrUndefinedEmptyStringNullArray(form.fatherLastName) ? null : form.fatherLastName,
      motherLastName: isNullOrUndefinedEmptyStringNullArray(form.motherLastName) ? null : form.motherLastName,
      email: isNullOrUndefinedEmptyStringNullArray(form.email) ? this.user.email : form.email,
      userName: this.user.userName,
      imageURL: this.imageURL,
      roles: [form.role.name],
      agencyId: form.agency.id,
    };

    this._usersService.update(_model, requestParameters).subscribe({
      next: (result: any) => {
        if (result.status === 200) {
          this._usersService.getUserByIdFromDb(requestParameters).subscribe();
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {},
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
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {},
      complete: () => {

      },
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
      next: (result: any) => {},
      error: (error) => {},
      complete: () => {},
    });
  }

  // Para cuando se fuerza la contraseña. custom button
  onCustom() {
    this.onForcePassword();
  }

  // Para cuando se fuerza la contraseña. custom button
  onForcePassword() {
    const requestParameters: QueryParameters = {
      userId: this.id,
    };

    this._usersService.forcePassword(requestParameters).subscribe({
      next: (result: any) => {},
      error: (error) => {},
      complete: () => {},
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
      type: 'userProfile ',
      fileName: file.name,
      folderTo: forlderTo,
    };
    this._uploadService.fileUpload(requestParameters, file).subscribe({
      next: (result: any) => {
        if (result.status === 200) {
          this.fileResponse = result.body;
          this.imageURL = this.fileResponse.urlPath;
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error: any) => {},
      complete: () => {},
    });
  }

  handleMissingImage(event: Event) {
    this.imageURL = 'assets/images/avatars/profile.png';
  }

  compare(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1 === o2;
    }
    return false;
  }

  compareString(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1.name.split(' ').join('') === o2;
    }
    return false;
  }

  /**
   * Deshabilita los controles editables del formulario
   */
  private disableEditableFormControls(): void {
    // Deshabilitar todos los controles excepto email y otros campos sensibles
    handleFormControls(this.headerConfig.formGroup.get('datosPersonales') as UntypedFormGroup, 'disable', {
      controls: ['email', 'userName'],
      mode: 'include',
    });
  }
}
