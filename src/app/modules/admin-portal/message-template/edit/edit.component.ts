import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ActivatedRoute } from '@angular/router';
import { MessageTemplateService } from 'app/shared/services/message-template.service';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MessageTemplate } from 'app/shared/models/MessageTemplate';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { QuillModule } from 'ngx-quill';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-edit-message-template',
    templateUrl: './edit.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        CommonModule,
        MatSnackBarModule,
        GenericHeaderComponent,
        TranslocoModule,
        QuillModule,
    ]
})
export class EditMessageTemplateComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _messageTemplateService = inject(MessageTemplateService);
  private _route = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);
  private _transloco = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _customRouterService = inject(CustomRouterService);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  messageTemplateId: number;

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
    title: 'message-template.edit.title',
    formGroup: this._formBuilder.group({
      templateKey: [{ value: null, disabled: true }, Validators.required],
      purposeES: [null],
      purposeEN: [null],
      purpose: [null], // Campo dinámico que muestra purposeES o purposeEN según el idioma
      titleES: [null, Validators.required],
      titleEN: [null, Validators.required],
      bodyES: [null, Validators.required],
      bodyEN: [null, Validators.required],
      icon: [null],
      image: [null],
      link: [null],
      useRouter: [false],
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

    if (resolvedData && resolvedData.messageTemplate) {
      this.messageTemplateId = resolvedData.messageTemplate.id;
      this.loadMessageTemplate(resolvedData.messageTemplate);
    }

    // Suscribirse a cambios de idioma para actualizar el campo purpose
    this._transloco.langChanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.updatePurposeField();
      });

    // Suscribirse a cambios en el campo purpose para guardar en el campo correcto
    this.headerConfig.formGroup.get('purpose')?.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value) => {
        const currentLang = this._transloco.getActiveLang();
        if (currentLang === 'en') {
          this.headerConfig.formGroup.get('purposeEN')?.setValue(value, { emitEvent: false });
        } else {
          this.headerConfig.formGroup.get('purposeES')?.setValue(value, { emitEvent: false });
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Actualiza el campo purpose con el valor correspondiente según el idioma activo
   */
  private updatePurposeField(): void {
    const currentLang = this._transloco.getActiveLang();
    const purposeValue = currentLang === 'en' 
      ? this.headerConfig.formGroup.get('purposeEN')?.value
      : this.headerConfig.formGroup.get('purposeES')?.value;
    
    this.headerConfig.formGroup.get('purpose')?.setValue(purposeValue || '', { emitEvent: false });
    this._cdr.markForCheck();
  }

  loadMessageTemplate(data: MessageTemplate) {
    this.headerConfig.formGroup.patchValue({
      templateKey: data.templateKey,
      purposeES: data.purposeES,
      purposeEN: data.purposeEN,
      titleES: data.titleES,
      titleEN: data.titleEN,
      bodyES: data.bodyES,
      bodyEN: data.bodyEN,
      icon: data.icon,
      image: data.image,
      link: data.link,
      useRouter: data.useRouter,
      isActive: data.isActive,
    });
    // Actualizar el campo purpose dinámico después de cargar los datos
    this.updatePurposeField();
    this._cdr.markForCheck();
  }

  /**
   * Getter para obtener el label del propósito según el idioma activo
   */
  get purposeLabel(): string {
    const currentLang = this._transloco.getActiveLang();
    return currentLang === 'en' 
      ? this._transloco.translate('message-template.edit.purposeEN.label')
      : this._transloco.translate('message-template.edit.purposeES.label');
  }

  /**
   * Getter para obtener el placeholder del propósito según el idioma activo
   */
  get purposePlaceholder(): string {
    const currentLang = this._transloco.getActiveLang();
    return currentLang === 'en' 
      ? this._transloco.translate('message-template.edit.purposeEN.placeholder')
      : this._transloco.translate('message-template.edit.purposeES.placeholder');
  }

  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open(
        this._transloco.translate('message-template.edit.messages.formInvalid'),
        this._transloco.translate('message-template.edit.messages.close'),
        { duration: 5000 }
      );
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.getRawValue();
    const templateKeyControl = this.headerConfig.formGroup.get('templateKey');

    const messageTemplateRequest: Partial<MessageTemplate> = {
      id: this.messageTemplateId,
      templateKey: templateKeyControl?.value || formValues.templateKey,
      purposeES: formValues.purposeES,
      purposeEN: formValues.purposeEN,
      titleES: formValues.titleES,
      titleEN: formValues.titleEN,
      bodyES: formValues.bodyES,
      bodyEN: formValues.bodyEN,
      icon: formValues.icon,
      image: formValues.image,
      link: formValues.link,
      useRouter: formValues.useRouter,
      isActive: formValues.isActive,
    };

    this._messageTemplateService.updateMessageTemplate(messageTemplateRequest).subscribe({
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
        this._customRouterService.navigate(['message-template']);
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
    this._customRouterService.navigate(['message-template']);
  }
}

