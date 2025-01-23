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
import { isNullOrUndefinedEmptyStringNullArray } from 'app/shared/utils';
import { UploadFolderEnum } from 'app/shared/models/Upload/UploadFolderEnum';
import { FileResponse } from 'app/shared/models/Upload/FileResponse';
import { TranslocoModule } from '@ngneat/transloco';


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
  ],
})
export class UsersEditComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private route: ActivatedRoute = inject(ActivatedRoute);
  private _formBuilder: UntypedFormBuilder = inject(UntypedFormBuilder);
  private _usersService: UsersService = inject(UsersService);
  private _uploadService: UploadService = inject(UploadService);
  private _customRouter: CustomRouterService = inject(CustomRouterService);
  private _changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  title?: string = 'Editar usuario';
  formRoot: UntypedFormGroup;
  imageURL: string;
  fileToUpload: File = null;
  fileResponse: FileResponse;

  id?: string = null;
  user?: any;

  listRoles: any[] = [];
  listClients: any[] = [];

  constructor() {}

  ngOnInit() {
    this.formRoot = this._formBuilder.group({
      datosPersonales: this._formBuilder.group({
        userName: new FormControl(null, [Validators.required, Validators.email]),
        email: new FormControl({ value: null, readonly: true }, [Validators.required, Validators.email]),
        firstName: new FormControl(null, Validators.required),
        fatherLastName: new FormControl(null, Validators.required),
        role: new FormControl(null, Validators.required),
      }),
      password: this._formBuilder.group(
        {
          currentPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          newPassword: new FormControl(null, [Validators.required, Validators.minLength(8)]),
        },
        {
          validators: this.onPassword.bind(this),
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
        this.formRoot.controls.datosPersonales.patchValue({
          role: this.user.roles[0],
        });
      }

      // Mark for check
      this._changeDetectorRef.markForCheck();
    });

    // this._clientsService.clients$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
    //   this.listClients = result.body.data;
    //   // Mark for check
    //   this._changeDetectorRef.markForCheck();
    // });
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

    this.formRoot.controls.datosPersonales.patchValue({
      userName: this.user.userName,
      email: this.user.email,
      firstName: this.user.firstName,
      fatherLastName: this.user.fatherLastName,
    });

    this.formRoot.get('datosPersonales').get('userName').disable();
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

  onSubmit() {
    if (this.formRoot.controls.datosPersonales.valid) {
      this.onUpdate(this.formRoot.value.datosPersonales);
    } else {
      this.formRoot.get('password').get('currentPassword').setErrors({ passwordNotMatch: true });
      this.formRoot.get('password').get('newPassword').setErrors({ passwordNotMatch: true });
      this.formRoot.markAllAsTouched();
    }
  }

  onUpdate(form: any) {
    const requestParameters: QueryParameters = {};

    const _model: RequestUser = {
      id: this.id,
      name: isNullOrUndefinedEmptyStringNullArray(form.name) ? null : form.name,
      lastName: isNullOrUndefinedEmptyStringNullArray(form.lastName) ? null : form.lastName,
      email: isNullOrUndefinedEmptyStringNullArray(form.email) ? null : form.email,
      userName: this.user.userName,
      roles: [form.role.name],
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
        //this.onBack();
      },
    });
  }

  onUpdatePassword(form: any) {
    const _model: ChangePassword = {
      id: this.user.id,
      email: isNullOrUndefinedEmptyStringNullArray(this.formRoot.controls.datosPersonales.value.email) ? null : this.formRoot.controls.datosPersonales.value.email,
      password: isNullOrUndefinedEmptyStringNullArray(this.formRoot.controls.contrasena.value.currentPassword)
        ? null
        : this.formRoot.controls.contrasena.value.currentPassword,
      newPassword: isNullOrUndefinedEmptyStringNullArray(this.formRoot.controls.contrasena.value.newPassword) ? null : this.formRoot.controls.contrasena.value.newPassword,
    };

    this._usersService.changePassword(_model, null).subscribe({
      next: (result: any) => {
        if (result.status === 200) {
          this._changeDetectorRef.markForCheck();
        }
      },
      error: (error) => {},
      complete: () => {
        //this.onBack();
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

  compare(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1.name === o2;
    }
    return false;
  }

  compareString(o1: any, o2: any): boolean {
    if (!isNullOrUndefinedEmptyStringNullArray(o2)) {
      return o1.name.split(' ').join('') === o2;
    }
    return false;
  }
}
