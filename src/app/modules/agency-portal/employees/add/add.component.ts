import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { ViewEncapsulation } from '@angular/core';
import { EmployeeService } from 'app/shared/services/employee.service';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { EmployeeRequest } from 'app/shared/models/Request/EmployeeRequest';
import { NgForOf, NgIf } from '@angular/common';
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
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { AuthService } from 'app/core/auth/auth.service';
import { compare, comparePostal, isNullOrUndefinedEmptyStringNullArray, minimumAgeValidator } from 'app/shared/utils';
import { OptionSelectionService } from 'app/shared/services/option-selection.service';
import { GeoService } from 'app/shared/services/geo.service';
import { City } from 'app/shared/models/City';
import { Region } from 'app/shared/models/Region';
import { QueryParameters } from 'app/shared/models/QueryParameters';



@Component({
  selector: 'app-employee-add',
  templateUrl: './add.component.html',
  providers: [provideNativeDateAdapter()],

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
    NgForOf,
    TranslocoModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatIconModule,
    MatTimepickerModule,
    MatIconModule,
  ],
})
export class AddEmployeeComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers {
  private _formBuilder = inject(UntypedFormBuilder);
  private _employeeService = inject(EmployeeService);
  private _customRouterService = inject(CustomRouterService);
  private _notificationService = inject(NotificationService);
  private _translocoService = inject(TranslocoService);
  private _authService = inject(AuthService);
  private _optionSelectionService = inject(OptionSelectionService);
  private _geoService = inject(GeoService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Lista de Status
  listStatus: OptionSelection[] = [];
  // Lista de Posiciones
  listPositions: OptionSelection[] = [];
  // Lista de Ciudades
  listCities: City[] = [];
  // Lista de Regiones
  listRegions: Region[] = [];

  headerConfig: GenericHeaderConfig = {
    title: 'employees.add.title',
    formGroup: this._formBuilder.group({
      // Nombre
      // First name
      firstName: new FormControl('', [Validators.required]),
      // Middle name
      // Middle name
      middleName: new FormControl(''),
      // Apellido Paterno
      // Last name
      // Last name
      fatherLastName: new FormControl('', [Validators.required]),
      // Apellido Materno
      // Mother last name
      motherLastName: new FormControl(''),
      // Status
      // Status
      status: new FormControl('', [Validators.required]),
      // Cargo
      // Position
      position: new FormControl('', [Validators.required]),
      // Fecha de nacimiento
      // Birth date
      birthDate: new FormControl('', [Validators.required, minimumAgeValidator(18)]),
      // Email
      // Email
      email: new FormControl('', [Validators.required, Validators.email]),
      // Dirección postal
      // Postal address
      postalAddress: new FormControl('', [Validators.required]),
      // Ciudad
      // City
      city: new FormControl('', [Validators.required]),
      // Región
      // Region
      region: new FormControl('', [Validators.required]),
      // Código de área
      // Area code
      areaCode: new FormControl('', [Validators.required]),
      // Comentarios
      // Comments
      comments: new FormControl(''),
    }),
    // Cancel button
    cancelButtonShow: true,
    cancelButtonText: 'employees.add.buttons.cancel',
    // Submit button
    submitButtonShow: true,
    submitButtonText: 'employees.add.buttons.save',
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

    // Cargar opciones
    this._optionSelectionService.options$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        // Status
        this.listStatus = result.body.data.filter((option: OptionSelection) => option.optionKey === 'isActive');
        // Positions
        this.listPositions = result.body.data.filter((option: OptionSelection) => option.optionKey === 'employeePosition');

        this._changeDetectorRef.detectChanges();
      }
    });

    // Cities
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listCities = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });

    // Regions
    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result.body)) {
        this.listRegions = result.body;
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
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

    // Dirección postal
    const postalAddress: string = formValues.postalAddress;
    // Código de área
    const areaCode: string = formValues.areaCode;
    // Comentarios
    const comments: string = formValues.comments;
    // Email
    const email: string = formValues.email;
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
    this._employeeService.insertEmployee(employeeRequest, {}).subscribe({
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
        // Reset the form
        this.headerConfig.formGroup.reset();
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
