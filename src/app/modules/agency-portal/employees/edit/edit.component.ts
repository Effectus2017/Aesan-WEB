import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from 'app/shared/services/employee.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { EmployeeRequest } from 'app/shared/models/request/EmployeeRequest';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { NgIf, NgForOf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { OptionSelection } from 'app/shared/models/common/OptionSelection';
import { City } from 'app/shared/models/location/City';
import { Region } from 'app/shared/models/location/Region';
import { compare, comparePostal, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator } from 'app/shared/utils';
import { AuthService } from 'app/core/auth/auth.service';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { GeoService } from 'app/shared/services/geo.service';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { provideNativeDateAdapter } from '@angular/material/core';



@Component({
  selector: 'app-employee-edit',
  templateUrl: './edit.component.html',
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    GenericHeaderComponent,
    NgIf,
    TranslocoModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatIconModule,
    MatTimepickerModule,
    MatIconModule,
  ],
})
export class EditEmployeeComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _employeeService = inject(EmployeeService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _route = inject(ActivatedRoute);
  private _authService = inject(AuthService);
  private _translocoService = inject(TranslocoService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _geoService = inject(GeoService);
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _changeDetectorRef = inject(ChangeDetectorRef);
  // Lista de Status
  listStatus: OptionSelection[] = [];
  // Lista de Posiciones
  listPositions: OptionSelection[] = [];
  // Lista de Ciudades
  listCities: City[] = [];
  // Lista de Regiones
  listRegions: Region[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'employees.edit.title',
    formGroup: this._formBuilder.group({
      id: new FormControl(''),
      firstName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      fatherLastName: new FormControl('', [Validators.required]),
      motherLastName: new FormControl(''),
      status: new FormControl('', [Validators.required]),
      position: new FormControl('', [Validators.required]),
      birthDate: new FormControl('', [Validators.required, minimumAgeValidator(18)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      postalAddress: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      region: new FormControl('', [Validators.required]),
      areaCode: new FormControl('', [Validators.required]),
      comments: new FormControl(''),
    }),
    submitButtonShow: true,
    submitButtonText: 'employees.edit.submitButton',
    cancelButtonShow: true,
    cancelButtonText: 'employees.edit.cancelButton',
  };

  // Compare methods
  compare = compare;
  comparePostal = comparePostal;
  compareById = (a: any, b: any) => a && b && a.id === b.id;

  // Agencia Id
  agencyId: number = 0;

  // Loading
  isLoading: boolean = false;

  // Lenguaje actual
  currentLang: string = 'es';

  ngOnInit(): void {
    // Obtener Agencia desde local storage desde AuthService
    this.agencyId = this._authService.getAgencyId();

    // Transloco
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });

    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      // Status
      this.listStatus = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'status');
      // Positions
      this.listPositions = resolvedData.options.data.filter((option: OptionSelection) => option.optionKey === 'employeePosition');
      // Cities
      this.listCities = resolvedData.cities;
      // Regions
      this.listRegions = resolvedData.regions;
      // Employee data
      this.onSetForm(resolvedData.employee);

      this._changeDetectorRef.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(employee: any): void {
    this.headerConfig.formGroup.patchValue({
      id: employee.id,
      firstName: employee.firstName,
      middleName: employee.middleName,
      fatherLastName: employee.fatherLastName,
      motherLastName: employee.motherLastName,
      status: employee.statusId,
      position: employee.positionId,
      birthDate: employee.birthDate,
      email: employee.email,
      postalAddress: employee.postalAddress,
      city: employee.cityId,
      region: employee.regionId,
      areaCode: employee.areaCode,
      comments: employee.comments,
    });
  }

  onSubmit(): void {
    // Validar formulario
    if (this.headerConfig.formGroup.invalid) {
      this._notificationService.showError('Por favor, complete todos los campos requeridos');
      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    const formValues = this.headerConfig.formGroup.value;

    // Ciudad
    const cityId: number = formValues.city.id;
    // Región
    const regionId: number = formValues.region.id;

    // Status
    const statusId: number = formValues.status.id;
    // Cargo
    const positionId: number = formValues.position.id;
    // Fecha de nacimiento
    const birthDate: string = formValues.birthDate;
    // Email
    const email: string = formValues.email;
    // Dirección postal
    const postalAddress: string = formValues.postalAddress;
    // Código de área
    const areaCode: string = formValues.areaCode;
    // Comentarios
    const comments: string = formValues.comments;
    // Nombre
    const firstName: string = formValues.firstName;
    // Middle name
    const middleName: string = formValues.middleName;
    // Apellido Paterno
    const fatherLastName: string = formValues.fatherLastName;
    // Apellido Materno
    const motherLastName: string = formValues.motherLastName;
    // Loading
    this.isLoading = true;

    // Crear empleado
    const employeeRequest: EmployeeRequest = {
      agencyId: this.agencyId,
      id: formValues.id,
      firstName: firstName,
      middleName: middleName,
      fatherLastName: fatherLastName,
      motherLastName: motherLastName,
      statusId: statusId,
      positionId: positionId,
      birthDate: birthDate,
      email: email,
      postalAddress: postalAddress,
      cityId: cityId,
      regionId: regionId,
      areaCode: areaCode,
      comments: comments,
      isActive: true,
    };

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Crear empleado
    this._employeeService.updateEmployee(employeeRequest, {}).subscribe({
      next: (response) => {
        switch (response.body) {
          case true:
            this._notificationService.showSuccessDialog();
            break;
          default:
            this._notificationService.showErrorDialog();
            break;
        }
      },
      error: (err) => {
        this._notificationService.showErrorDialog();
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        this.isLoading = false;
        // Enable the form
        this.headerConfig.formGroup.enable();
      },
    });
  }

  onCancel(): void {
    this._customRouterService.navigate(['employees/list']);
  }

  // Método para obtener todas las regiones según el ID de la ciudad
  // Get all regions by city ID
  getRegionsByCityId(city: City, target: string): void {
    if (!city) return;

    const queryParameters: QueryParameters = {
      cityId: city.id,
    };

    this._geoService.getRegionsByCityId(queryParameters).subscribe({
      next: (response) => {
        if (response?.body?.data) {
          if (target === 'region') {
            this.listRegions = response.body.data;
            const regionControl = this.headerConfig.formGroup.get('region');
            if (regionControl) {
              if (this.listRegions.length === 1) {
                // Asignar automáticamente la única región encontrada para Dirección Física
                this.headerConfig.formGroup.patchValue({ region: this.listRegions[0] });
              } else {
                regionControl.setValue(null);
              }
            }
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar las regiones:', error);
      },
    });
  }
}
