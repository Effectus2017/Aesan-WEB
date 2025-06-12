import { TextFieldModule } from '@angular/cdk/text-field';
import { NgFor } from '@angular/common';
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
import { Agency } from 'app/shared/models/Agency';
import { GeoService } from 'app/shared/services/geo.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { UpdateAgencyInscriptionRequest } from 'app/shared/models/Request/AgencyRequest';
import { compareByProperty, isNullOrUndefinedEmptyStringNullArray, showErrorDialog, showSuccessDialog } from 'app/shared/utils';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { City } from 'app/shared/models/City';
import { HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AuthService } from 'app/core/auth/auth.service';
import { NgClass } from '@angular/common';
import { FuseConfigService } from '@fuse/services/config';
import { ProgramService } from 'app/shared/services/program.service';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';

@Component({
    selector: 'app-monitor-preoperational-visit-edit',
    templateUrl: './edit.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgFor,
        NgClass,
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
        GenericHeaderComponent,
        TranslocoModule,
        MatSnackBarModule,
        MatDialogModule,
        MatDatepickerModule,
    ]
})
export class EditMonitorPreoperationalVisitComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _agencyStatusService = inject(AgencyStatusService);
  private _geoService = inject(GeoService);
  private _programService = inject(ProgramService);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);
  private _customRouterService = inject(CustomRouterService);
  private _fuseConfigService = inject(FuseConfigService);

  listAgencyStatus = [];
  listPrograms = [];
  listCities = [];
  listRegions = [];

  listAppointmentCoordinated = [
    { id: 1, name: 'Si', value: true },
    { id: 2, name: 'No', value: false },
  ];

  param: Agency;

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'monitor-preoperational-visit.title',
    formGroup: this._formBuilder.group({
      program: [{ value: null, disabled: true }],
      name: [{ value: null, disabled: true }],
      status: [null, Validators.required],
      // Datos de la UIe
      uieNumber: [{ value: null, disabled: true }],
      // Datos de la ciudad y región
      city: [{ value: null, disabled: true }],
      region: [{ value: null, disabled: true }],
      // Dirección y Coordenadas
      address: [{ value: null, disabled: true }],
      phone: [{ value: null, disabled: true }],
      zipCode: [{ value: null, disabled: true }],
      // Datos del Contacto
      firstName: [{ value: null, disabled: true }],
      middleName: [{ value: null, disabled: true }],
      fatherLastName: [{ value: null, disabled: true }],
      motherLastName: [{ value: null, disabled: true }],

      // Datos del Administrador
      email: [{ value: null, disabled: true }, Validators.email],
      // ¿Se coordinó cita con el auspiciador?
      appointmentCoordinated: [null, Validators.required],
      // Fecha de Cita
      appointmentDate: [null],
      // Justificación de Rechazo
      rejectionJustification: [null],
      // Comentarios
      comments: [null],
    }),
    saveButtonText: 'global.buttons.save',
    saveButtonShow: true,
  };

  isDarkMode: boolean = false;

  constructor() {}

  ngOnInit() {
    // Agregar el observador para appointmentCoordinated
    this.headerConfig.formGroup.get('appointmentCoordinated').valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((value: boolean) => {
        const appointmentDateControl = this.headerConfig.formGroup.get('appointmentDate');
        if (value === true) {
          appointmentDateControl.setValidators([Validators.required]);
        } else {
          appointmentDateControl.clearValidators();
        }
        appointmentDateControl.updateValueAndValidity();
      });

    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
    if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listCities = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
        if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listRegions = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    this._programService.programs$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
        if (result.body.data) {
          this.listPrograms = result.body.data;
          this._changeDetectorRef.detectChanges();
        }
      });

    this._agencyStatusService.agencyStatuses$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.listAgencyStatus = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (!isNullOrUndefinedEmptyStringNullArray(result)) {
        this.onSetForm(result.body);
        this._changeDetectorRef.detectChanges();
      }
    });

    // Suscribirse a los cambios del tema
    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        this.isDarkMode = config.scheme === 'dark' ? true : false;
        console.log('Tema actual:', config.scheme);
        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Agency) {
    console.log(param);
    this.param = param;

    if (isNullOrUndefinedEmptyStringNullArray(param.programs)) {
      this._snackBar.open('Esta agencia no tiene programas asignados que coincidan con el usuario.', 'Cerrar', {
        duration: 10000,
      });
      this._customRouterService.navigate(['pre-operational']); // Cambia 'pre-operational' por la ruta correcta si es necesario
      return;
    }

    this.headerConfig.formGroup.patchValue({
      program: param.programs || null,
      status: param.status,
      // Datos de la agencia
      name: param.name || null,
      uieNumber: param.uieNumber || null,
      // Datos de la dirección
      address: param.address || null,
      zipCode: param.zipCode || null,
      // Datos de la ciudad y región
      city: param.city || null,
      region: param.region || null,
      // Datos del Contacto
      firstName: param.user.firstName || null,
      middleName: param.user.middleName || null,
      fatherLastName: param.user.fatherLastName || null,
      motherLastName: param.user.motherLastName || null,
      // Datos del Administrador
      email: param.email || null,
      phone: param.phone || null,
      // Datos de la cita
      appointmentCoordinated: param.appointmentCoordinated,
      appointmentDate: param.appointmentDate,
      // Justificación de Rechazo
      rejectionJustification: param.rejectionJustification,
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


    // Obtener los valores del formulario incluyendo los campos deshabilitados
    const formValues = this.headerConfig.formGroup.getRawValue();

    // Obtener el ID del usuario autenticado
    const userId = this._authService.getUserId();

    // Construir el objeto de actualización
    const agencyRequest: UpdateAgencyInscriptionRequest = {
      agencyId: this.param.id,
      statusId: formValues.status?.id,
      appointmentCoordinated: formValues.appointmentCoordinated,
      appointmentDate: formValues.appointmentDate,
      rejectionJustification: formValues.rejectionJustification,
    };

    // Llamar al servicio para actualizar
    this._agencyService.updateAgencyInscription(agencyRequest, null).subscribe({
      next: (response) => {

        switch (response.body) {
          case true:
            showSuccessDialog();
            break;
          default:
            this.showErrorDialog();
            break;
        }

      },
      error: (error) => {
        this.showErrorDialog();
      },
      complete: () => {
        console.log('Actualización completada');

        const queryParams: QueryParameters = {
          agencyId: this.param.id,
        };

        this._agencyService.getAgencyById(queryParams).subscribe();
      },
    });
  }

  /**
   * Guarda los cambios en la agencia
   */
  onSubmit() {
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
      error: (error) => {
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
      },
      complete: () => {
        // const queryParams: QueryParameters = {
        //   agencyId: this.param.id,
        // };

        // this._agencyService.getAgencyById(queryParams).subscribe();

        this._customRouterService.navigate([`pre-operational/list`]);
      },
    });
  }

  /**
   * Rechaza la agencia
   */
  onReject() {}

  // Método para obtener todas las regiones según el ID de la ciudad
  getRegionsByCityId(city: City): void {
    const queryParams: QueryParameters = {
      cityId: city.id,
      alls: true,
    };

    this._geoService.getRegionsByCityId(queryParams).subscribe({
      next: (response: HttpResponse<any>) => {
        this.listRegions = response.body.data;
      },
      error: (error) => {
        console.error('Error al cargar las regiones', error);
      },
      complete: () => {
        console.log('Regiones cargadas con éxito');
      },
    });
  }

  // Función única para comparar diferentes tipos de elementos
  compareItems<T>(item1: T, item2: T): boolean {
    return compareByProperty(item1, item2, 'id' as keyof T);
  }

  compareItemPrograms<T>(item1: T, item2: T): boolean {
    return compareByProperty(item1, item2, 'id' as keyof T);
  }

  showErrorDialog() {
    this._fuseConfirmationService.open({
      title: this._translocoService.translate('monitor-preoperational-visit.dialog.error.title'),
      icon: {
        show: true,
        name: 'heroicons_outline:x-circle',
        color: 'error',
      },
      message: this._translocoService.translate('monitor-preoperational-visit.dialog.error.message'),
      actions: {
        confirm: {
          label: this._translocoService.translate('monitor-preoperational-visit.dialog.error.confirm'),
        },
        cancel: {
          show: false,
        },
      },
    });
  }
}
