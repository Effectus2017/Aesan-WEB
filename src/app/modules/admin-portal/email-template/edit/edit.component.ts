import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { EmailTemplateService } from 'app/shared/services/email-template.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmailTemplate } from 'app/shared/models/EmailTemplate';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { QuillModule } from 'ngx-quill';

@Component({
    selector: 'app-edit-email-template',
    templateUrl: './edit.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatTabsModule,
        CommonModule,
        MatSnackBarModule,
        GenericHeaderComponent,
        TranslocoModule,
        QuillModule,
    ]
})
export class EditEmailTemplateComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _emailTemplateService = inject(EmailTemplateService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _fuseConfirmationService = inject(FuseConfirmationService);

  emailTemplateId: number;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image']
    ]
  };

  headerConfig: GenericHeaderConfig = {
    title: 'email-template.edit.title',
    formGroup: this._formBuilder.group({
      templateKey: [{ value: null, disabled: true }, Validators.required],
      description: [null],
      subjectES: [null, Validators.required],
      subjectEN: [null, Validators.required],
      bodyES: [null, Validators.required],
      bodyEN: [null, Validators.required],
      isActive: [true],
    }),
    saveButtonShow: true,
    saveButtonText: 'global.buttons.save',
    cancelButtonShow: true,
    cancelButtonText: 'global.buttons.cancel',
    goToAddButtonShow: false,
  };

  constructor() {}

  ngOnInit(): void {
    // Obtener datos del resolver
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData && resolvedData.emailTemplate) {
      this.emailTemplateId = resolvedData.emailTemplate.id;
      this.loadEmailTemplate(resolvedData.emailTemplate);
    }
  }

  ngOnDestroy(): void {
    // Quill no requiere destrucción explícita
  }

  loadEmailTemplate(data: EmailTemplate) {
    this.headerConfig.formGroup.patchValue({
      templateKey: data.templateKey,
      description: data.description,
      subjectES: data.subjectES,
      subjectEN: data.subjectEN,
      bodyES: data.bodyES,
      bodyEN: data.bodyEN,
      isActive: data.isActive,
    });
    this._cdr.markForCheck();
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open(
        this._transloco.translate('email-template.edit.messages.formInvalid'),
        this._transloco.translate('email-template.edit.messages.close'),
        { duration: 5000 }
      );
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.getRawValue();
    const templateKeyControl = this.headerConfig.formGroup.get('templateKey');

    const emailTemplateRequest: Partial<EmailTemplate> = {
      id: this.emailTemplateId,
      templateKey: templateKeyControl?.value || formValues.templateKey,
      description: formValues.description,
      subjectES: formValues.subjectES,
      subjectEN: formValues.subjectEN,
      bodyES: formValues.bodyES,
      bodyEN: formValues.bodyEN,
      isActive: formValues.isActive,
    };

    this._emailTemplateService.updateEmailTemplate(emailTemplateRequest).subscribe({
      next: (result: any) => {
        switch (result.body) {
          case true:
            this._fuseConfirmationService.open({
              title: this._transloco.translate('dialog.success.title'),
              icon: {
                show: true,
                name: 'heroicons_outline:check-circle',
                color: 'success',
              },
              message: this._transloco.translate('dialog.success.message'),
              actions: {
                confirm: {
                  label: this._transloco.translate('dialog.success.confirm'),
                },
              },
            });
            break;
          default:
            this.showErrorDialog();
            break;
        }
      },
      error: (error) => {
        this._fuseConfirmationService.open({
          title: this._transloco.translate('dialog.error.title'),
          icon: {
            show: true,
            name: 'heroicons_outline:x-circle',
            color: 'error',
          },
          message: this._transloco.translate('dialog.error.message'),
          actions: {
            confirm: {
              label: this._transloco.translate('dialog.error.confirm'),
            },
          },
        });
      },
      complete: () => {
        this._customRouterService.navigate(['email-template']);
      },
    });
  }

  showErrorDialog() {
    this._fuseConfirmationService.open({
      title: this._transloco.translate('dialog.error.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:x-circle',
        color: 'error',
      },
      message: this._transloco.translate('dialog.error.message'),
      actions: {
        confirm: {
          label: this._transloco.translate('dialog.error.confirm'),
        },
      },
    });
  }

  onCancel() {
    this._customRouterService.navigate(['email-template']);
  }
}

