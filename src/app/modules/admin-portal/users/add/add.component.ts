import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { TranslocoService, TranslocoModule } from '@ngneat/transloco';

import _ from 'lodash';
import { UsersService } from '../../../../shared/services/users.service';
import { Subject, takeUntil } from 'rxjs';

import { UploadService } from 'app/shared/services/upload.service';
import { RequestUser } from '../users.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { AgencyService } from 'app/shared/services/agency.service';

@Component({
  selector: 'app-users-add',
  templateUrl: './add.component.html',
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
    GenericHeaderComponent
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

  headerConfig: GenericHeaderConfig = {
    title: 'users.add.title',
    saveButtonShow: true,
    saveButtonText: 'users.add.submit',
  };

  imageURL: string;
  fileToUpload: File = null;
  fileResponse: FileResponse;

  listRoles = [];
  listAgencies = [];

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

  ngOnInit() {
    this.headerConfig.formGroup = this._formBuilder.group({
      datosPersonales: this._formBuilder.group(
        {
          username: new FormControl({value: null, disabled: true}, [Validators.required, Validators.email, this.emailValidator()]),
          currentPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          newPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          email: new FormControl(null, [Validators.required, Validators.email, this.emailValidator()]),
          firstName: new FormControl(null, Validators.required),
          middleName: new FormControl(null),
          fatherLastName: new FormControl(null, Validators.required),
          motherLastName: new FormControl(null),
          role: new FormControl(null, Validators.required),
          agency: new FormControl(null, Validators.required),
        },
        {
          validators: this.onPassword.bind(this),
        }
      ),
    });

    // Suscribirse a los cambios del campo email
    this.headerConfig.formGroup.get('datosPersonales.email').valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(value => {
        this.headerConfig.formGroup.get('datosPersonales.username').setValue(value);
      });

    // Get the accountings
    this._usersService.roles$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.listRoles = result.body.data;
      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

    // Get the agencies list
    this._agencyService.agenciesList$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      this.listAgencies = result.body;
      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

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
    const requestParameters: QueryParameters = {
        agencyId: form.agency.id,
    };

    // si correo es null, no se puede actualizar
    if (isNullOrUndefinedEmptyStringNullArray(form.email)) {
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
      firstName: isNullOrUndefinedEmptyStringNullArray(form.firstName) ? null : form.firstName,
      middleName: isNullOrUndefinedEmptyStringNullArray(form.middleName) ? null : form.middleName,
      fatherLastName: isNullOrUndefinedEmptyStringNullArray(form.fatherLastName) ? null : form.fatherLastName,
      motherLastName: isNullOrUndefinedEmptyStringNullArray(form.motherLastName) ? null : form.motherLastName,
      userName: isNullOrUndefinedEmptyStringNullArray(form.email) ? null : form.email,
      email: isNullOrUndefinedEmptyStringNullArray(form.email) ? null : form.email,
      password: isNullOrUndefinedEmptyStringNullArray(form.newPassword) ? null : form.newPassword,
      roles: [form.role.name],
      imageURL: this.imageURL,
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
}
