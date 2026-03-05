import { TextFieldModule } from '@angular/cdk/text-field';
import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { Subject, takeUntil } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from 'app/shared/components/generic-header/generic-header.interface';
import { GenericHeaderComponent } from 'app/shared/components/generic-header/generic-header.component';
import { OnGenericEditComponentHandler } from 'app/shared/components/generic-interfaces/generic-interfaces.interface';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { AgencyService } from 'app/shared/services/agency.service';
import { AgencyResponse } from 'app/shared/models/Response/AgencyResponse';

import { GeoService } from 'app/shared/services/geo.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyRequest } from 'app/shared/models/Request/AgencyRequest';
import { compareById, compareItems, handleFormControls, maxDigitsValidator, alphanumericValidator } from 'app/shared/utils';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { City } from 'app/shared/models/City';
import { HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RejectDialogComponent } from '../reject-dialog/reject-dialog.component';
import { AuthService } from 'app/core/auth/auth.service';
import { UserAgencyRequest } from 'app/shared/models/Request/UserAgencyRequest';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { OptionSelection } from 'app/shared/models/OptionSelection';
import { ActivatedRoute } from '@angular/router';
import { StaffRequest } from 'app/shared/models/Request/StaffRequest';
import { NumericOnlyDirective } from 'app/shared/directives/numeric-only.directive';
import { PhoneFormatDirective } from 'app/shared/directives/phone-format.directive';
import { puertoRicoPhoneValidator } from 'app/shared/validators/puerto-rico-phone.validator';
import { puertoRicoZipCodeValidator } from 'app/shared/validators/puerto-rico-zip-code.validator';
import { PuertoRicoZipCodeDirective } from 'app/shared/directives/puerto-rico-zip-code.directive';
import { LatitudeDirective } from 'app/shared/directives/latitude.directive';
import { LongitudeDirective } from 'app/shared/directives/longitude.directive';

@Component({
  selector: 'app-admin-validation-to-program-edit',
  templateUrl: './edit.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
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
    GenericHeaderComponent,
    TranslocoModule,
    MatSnackBarModule,
    MatDialogModule,
    NumericOnlyDirective,
    PhoneFormatDirective,
    PuertoRicoZipCodeDirective,
    LatitudeDirective,
    LongitudeDirective,
  ],
})
export class EditValidationToProgramComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _geoService = inject(GeoService);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);
  private _customRouterService = inject(CustomRouterService);
  private _route = inject(ActivatedRoute);

  listAgencyStatus = [];
  listPrograms = [];
  listCities = [];
  listRegions = [];
  listPostalRegions = [];
  listUsers = [];
  listPositions: OptionSelection[] = [];

  param: AgencyResponse;

  // Lenguaje actual
  currentLang: string = 'es';

  isLoading = false;

  // Compare methods
  compareById = compareById;
  compareItems = compareItems;
  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'validation-to-program.edit.title',
    formGroup: this._formBuilder.group({
      name: [null, Validators.required],
      program: [null, Validators.required],
      status: [null, Validators.required],

      // Datos de la Agencia
      uieNumber: [null, [Validators.required, maxDigitsValidator(12)]],
      sdrNumber: [null, [Validators.required, maxDigitsValidator(10)]],
      einNumber: [null, [Validators.required, maxDigitsValidator(9)]],

      // Datos de la Ciudad y Región
      city: [null, Validators.required],
      region: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],

      // Dirección y Coordenadas
      address: [null, Validators.required],
      phone: [null, [Validators.required, puertoRicoPhoneValidator()]],
      zipCode: [null, [Validators.required, puertoRicoZipCodeValidator()]],

      // Dirección Postal
      postalAddress: [null, Validators.required],
      postalZipCode: [null, [Validators.required, puertoRicoZipCodeValidator()]],
      postalCity: [null, Validators.required],
      postalRegion: [null, Validators.required],

      // Datos del Contacto
      firstName: [{ value: null }],
      middleName: [{ value: null }],
      fatherLastName: [{ value: null }],
      motherLastName: [{ value: null }],

      // Datos del Administrador
      email: [{ value: null, disabled: true }, Validators.email],
      position: [{ value: null }],
    }),
    submitButtonText: 'validation-to-program.edit.submit',
    submitButtonShow: true,
    saveButtonText: 'validation-to-program.edit.save',
    saveButtonShow: true,
    rejectButtonText: 'validation-to-program.edit.reject',
    rejectButtonShow: true,
  };

  constructor() {}

  ngOnInit() {
    // Obtener datos del resolver en lugar de suscribirse
    const resolvedData = this._route.snapshot.data['data'];

    if (resolvedData) {
      // Asignar datos directamente desde el resolver (sin .body)
      this.param = resolvedData.agency;
      this.listAgencyStatus = resolvedData.agencyStatuses;
      this.listCities = resolvedData.cities;
      this.listRegions = resolvedData.regions;
      this.listPostalRegions = resolvedData.regions;
      this.listPrograms = resolvedData.programs;
      this.listUsers = resolvedData.users;
      this.listPositions = resolvedData.options;

      // Configurar el formulario con los datos
      this.onSetForm(resolvedData.agency);
      this._changeDetectorRef.detectChanges();
    }

    // Solo mantener la suscripción de Transloco que no causa conflictos
    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: AgencyResponse) {
    this.param = param;

    this.headerConfig.formGroup.patchValue({
      name: param.name || null,
      city: param.city || null,
      region: param.region || null,
      program: param.programs?.[0] || null,
      status: param.status || null,
      sdrNumber: param.sdrNumber || null,
      uieNumber: param.uieNumber || null,
      einNumber: param.einNumber || null,
      // Dirección
      address: param.address || null,
      zipCode: param.zipCode || null,
      latitude: param.latitude !== null && param.latitude !== undefined ? param.latitude.toString() : null,
      longitude: param.longitude !== null && param.longitude !== undefined ? param.longitude.toString() : null,
      // Dirección Postal
      postalAddress: param.postalAddress || null,
      postalZipCode: param.postalZipCode || null,
      postalCity: param.postalCity || null,
      postalRegion: param.postalRegion || null,
      // Datos del Contacto
      firstName: param.user?.firstName || null,
      middleName: param.user?.middleName || null,
      fatherLastName: param.user?.fatherLastName || null,
      motherLastName: param.user?.motherLastName || null,
      email: param.email || null,
      phone: param.phone || null,
      position: param.user?.position || null,
    });
  }

  /**
   * Guarda los cambios en la agencia
   */
  onSave() {
    if (this.headerConfig.formGroup.invalid) {
      this._snackBar.open('El formulario es inválido. Por favor, complete todos los campos requeridos.', 'Cerrar', {
        duration: 5000,
      });

      this.headerConfig.formGroup.markAllAsTouched();
      return;
    }

    // Disable the form
    this.headerConfig.formGroup.disable();

    // Obtener los valores del formulario
    const formValues = this.headerConfig.formGroup.value;

    const assignedBy = this._authService.getUserId();

    // Construir el objeto de actualización
    const agencyRequest: AgencyRequest = {
      name: formValues.name,
      cityId: formValues.city?.id,
      regionId: formValues.region?.id,
      statusId: formValues.status?.id,
      sdrNumber: formValues.sdrNumber ? parseInt(formValues.sdrNumber.toString(), 10) : 0,
      uieNumber: formValues.uieNumber && formValues.uieNumber.toString().trim() !== '' ? parseInt(formValues.uieNumber.toString(), 10) || 0 : 0,
      einNumber: formValues.einNumber ? parseInt(formValues.einNumber.toString(), 10) : 0,
      address: formValues.address,
      zipCode: formValues.zipCode,
      latitude: parseFloat(formValues.latitude),
      longitude: parseFloat(formValues.longitude),
      postalAddress: formValues.postalAddress,
      postalZipCode: formValues.postalZipCode,
      postalCityId: formValues.postalCity?.id,
      postalRegionId: formValues.postalRegion?.id,
      email: formValues.email,
      phone: formValues.phone,
      programs: formValues.program ? [formValues.program.id] : [],
      assignedBy: assignedBy,
    };

    const staffRequest: StaffRequest = {
      id: this.param.user.id,
      firstName: formValues.firstName,
      middleName: formValues.middleName,
      fatherLastName: formValues.fatherLastName,
      motherLastName: formValues.motherLastName,
      positionId: formValues.position?.id,
      email: formValues.email,
    };

    const userAgencyRequest: UserAgencyRequest = {
      agency: agencyRequest,
      staff: staffRequest,
    };

    // Parámetros de consulta
    const queryParams: QueryParameters = {
      agencyId: this.param.id,
    };

    // Llamar al servicio para actualizar
    this._agencyService.updateAgency(userAgencyRequest, queryParams).subscribe({
      next: (response) => {
        switch (response.status) {
          case 200:
            this._fuseConfirmationService.open({
              title: this._translocoService.translate('dialog.success.title'),
              icon: {
                show: true,
                name: 'heroicons_outline:check-circle',
                color: 'success',
              },
              message: this._translocoService.translate('dialog.success.message'),
            });
            break;
          case 400:
            this._fuseConfirmationService.open({
              title: this._translocoService.translate('dialog.error.title'),
              icon: {
                show: true,
                name: 'heroicons_outline:exclamation-circle',
                color: 'error',
              },
              message: this._translocoService.translate('dialog.error.message'),
            });
            break;
          default:
            this._fuseConfirmationService.open({
              title: this._translocoService.translate('dialog.error.title'),
              icon: {
                show: true,
                name: 'heroicons_outline:exclamation-circle',
                color: 'error',
              },
              message: this._translocoService.translate('dialog.error.message'),
            });
            break;
        }
      },
      error: () => {
        this._fuseConfirmationService.open({
          title: this._translocoService.translate('dialog.error.title'),
          icon: {
            show: true,
            name: 'heroicons_outline:exclamation-circle',
            color: 'error',
          },
          message: this._translocoService.translate('dialog.error.message'),
        });
        this.enableEditableFormControls();
      },
      complete: () => {
        this.enableEditableFormControls();
        //this._agencyService.getAgencyById({ agencyId: this.param.id }).subscribe();
        this._customRouterService.navigate([`admin/sponsors/list`]);
      },
    });
  }

  /**
   * Guarda los cambios en la agencia
   */
  onSubmit() {
    if (this.isLoading) return;
    const queryParams: QueryParameters = {
      agencyId: this.param.id,
      statusId: 7, // Suponiendo que 7 es el ID para aprobar la agencia
    };

    this._agencyService.updateAgencyStatus(queryParams).subscribe({
      next: (response) => {
        if (response.body) {
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('dialog.success.title'),
            icon: {
              show: true,
              name: 'heroicons_outline:check-circle',
              color: 'success',
            },
            message: this._translocoService.translate('dialog.success.message'),
            actions: {
              confirm: {
                label: this._translocoService.translate('dialog.success.confirm'),
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
          title: this._translocoService.translate('dialog.error.title'),
          icon: {
            show: true,
            name: 'heroicons_outline:exclamation-circle',
            color: 'error',
          },
          message: this._translocoService.translate('dialog.error.message'),
          actions: {
            confirm: {
              label: this._translocoService.translate('dialog.error.confirm'),
            },
            cancel: {
              show: false,
            },
          },
        });
        this.enableEditableFormControls();
      },
      complete: () => {
        this.enableEditableFormControls();
        //this._agencyService.getAgencyById({ agencyId: this.param.id }).subscribe();
        this._customRouterService.navigate([`admin/sponsors/list`]);
      },
    });
  }

  /**
   * Rechaza la agencia
   */
  onReject() {
    this.showRejectDialog();
  }

  /**
   * Muestra el diálogo para ingresar la justificación del rechazo
   */
  private showRejectDialog(): void {
    const dialogRef = this._dialog.open(RejectDialogComponent, {
      data: { reason: '' },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        const queryParams: QueryParameters = {
          agencyId: this.param.id,
          statusId: 6,
          rejectionJustification: result.trim(),
        };

        this._agencyService.updateAgencyStatus(queryParams).subscribe({
          next: (response) => {
            if (response.body) {
              this._fuseConfirmationService.open({
                title: this._translocoService.translate('dialog.reject.title'),
                icon: {
                  show: true,
                  name: 'heroicons_outline:check-circle',
                  color: 'success',
                },
                message: this._translocoService.translate('dialog.reject.message'),
                actions: {
                  confirm: {
                    label: this._translocoService.translate('dialog.reject.ok'),
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
              title: this._translocoService.translate('dialog.error.title'),
              icon: {
                show: true,
                name: 'heroicons_outline:exclamation-circle',
                color: 'warn',
              },
              message: this._translocoService.translate('dialog.reject.errorMessage'),
              actions: {
                confirm: {
                  label: this._translocoService.translate('dialog.error.ok'),
                  color: 'primary',
                },
                cancel: {
                  show: false,
                },
              },
            });
            this.enableEditableFormControls();
          },
          complete: () => {
            //this.enableEditableFormControls();
            //this._agencyService.getAgencyById({ agencyId: this.param.id }).subscribe();
            //this._customRouterService.navigate([`admin/validation-to-program/list`]);
          },
        });
      }
    });
  }

  // Método para obtener todas las regiones según el ID de la ciudad
  getRegionsByCityId(city: City, target?: string): void {
    if (!city) return;

    const queryParams: QueryParameters = {
      cityId: city.id,
      alls: true,
    };

    this._geoService.getRegionsByCityId(queryParams).subscribe({
      next: (response: HttpResponse<any>) => {
        if (target === 'postalRegion') {
          this.listPostalRegions = response.body.data;
          const regionControl = this.headerConfig.formGroup.get('postalRegion');
          if (regionControl) {
            if (this.listPostalRegions.length === 1) {
              this.headerConfig.formGroup.patchValue({ postalRegion: this.listPostalRegions[0] });
            } else {
              regionControl.setValue(null);
            }
          }
        } else {
          this.listRegions = response.body.data;
          const regionControl = this.headerConfig.formGroup.get('region');
          if (regionControl) {
            if (this.listRegions.length === 1) {
              this.headerConfig.formGroup.patchValue({ region: this.listRegions[0] });
            } else {
              regionControl.setValue(null);
            }
          }
        }
      },
      error: (error) => {
        console.error('Error al cargar las regiones', error);
      },
      complete: () => {},
    });
  }

  private enableEditableFormControls(): void {
    // Habilitar todos los controles excepto email y otros campos sensibles
    handleFormControls(this.headerConfig.formGroup, 'enable', {
      controls: ['email'],
      mode: 'exclude',
    });
  }
}
