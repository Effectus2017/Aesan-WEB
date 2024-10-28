import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { Subject } from 'rxjs';
import { Program } from 'app/shared/models/Program';
import { ActivatedRoute } from '@angular/router';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatTableModule } from '@angular/material/table';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { OnGenericEditComponentHandler } from 'app/shared/components/generic-interfaces/generic-interfaces.interface';

@Component({
  selector: 'app-admin-validation-to-program-edit',
  standalone: true,
  templateUrl: './edit.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    NgClass,
    MatInputModule,
    TextFieldModule,
    MatDividerModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    GenericHeaderComponent,
  ],
})
export class ValidationToProgramEditComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  //   ValidationToProgramId: string;
  //   ValidationToProgram: Program;
  //   errorMessage: string = '';

  private _formBuilder = inject(UntypedFormBuilder);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _route = inject(ActivatedRoute);
  private _customRouterService = inject(CustomRouterService);

  list = ['Programar Visita', 'Orientación', 'Cumple con los requisitos', 'No cumple con los requisitos'];

  headerConfig: GenericHeaderConfig = {
    title: 'Validación de Aplicación al Programa',
    formGroup: this._formBuilder.group({
      programName: ['PDAM'],
      status: [''], // Este campo parece estar vacío en la imagen
      agencyName: ['FONDITA DE JUAN'],
      uieNumber: ['7454839948'],
      corporationNumber: ['789013'],
      ssPatronal: ['66-145674'],
      address: ['calle Esperanza Urb. Corazón'],
      phone: ['(xxx) xxx-xxxxx'],
      city: ['Caguas'],
      region: ['Arecibo'],
      firstName: ['JUAN'],
      paternalLastName: ['DEL PUEBLO'],
      maternalLastName: ['DÍAZ'],
      postalCode: ['00123'],
      email: ['juandelpueblo@fonditajuan.com'],
    }),
    submitButtonText: 'Aprobar',
    submitButtonShow: true,
    cancelButtonText: 'Rechazar',
    cancelButtonShow: true,
  };

  constructor() {}

  //   get domainControl() {
  //     return this.formRoot.get('domain');
  //   }

  ngOnInit() {
    // Inicializar el formulario
    // this.formRoot = this._formBuilder.group({
    // });
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: any) {
    console.log(param);
  }

  onUpdate(param: any) {
    console.log(param);
  }
}
