import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
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
import { UserService } from 'app/shared/services/user.service';
import { QueryParameters } from 'app/shared/models/QueryParameters';
import { AgencyRequest } from 'app/shared/models/Request/AgencyRequest';
import { compareByProperty } from 'app/shared/utils';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { City } from 'app/shared/models/City';
import { HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RejectDialogComponent } from '../reject-dialog/reject-dialog.component';
import { AgencyStatusService } from 'app/shared/services/agency-status.service';
import { ProgramService } from 'app/shared/services/program.service';
import { UsersService } from 'app/shared/services/users.service';
import { AuthService } from 'app/core/auth/auth.service';

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
    GenericHeaderComponent,
    TranslocoModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
})
export class EditValidationToProgramComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _agencyStatusService = inject(AgencyStatusService);
  private _geoService = inject(GeoService);
  private _programService = inject(ProgramService);
  private _usersService = inject(UsersService);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _fuseConfirmationService = inject(FuseConfirmationService);
  private _translocoService = inject(TranslocoService);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);

  listAgencyStatus = [];
  listPrograms = [];
  listCities = [];
  listRegions = [];
  listPostalRegions = [];
  listUsers = [];

  param: Agency;

  // Configuración del header
  headerConfig: GenericHeaderConfig = {
    title: 'validation-to-program.edit.title',
    formGroup: this._formBuilder.group({
      name: [null, Validators.required],
      program: [null, Validators.required],
      status: [null, Validators.required],

      // Datos de la Agencia
      uieNumber: [null, Validators.required],
      sdrNumber: [null, Validators.required],
      einNumber: [null, Validators.required],

      // Datos de la Ciudad y Región
      city: [null, Validators.required],
      region: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],

      // Dirección y Coordenadas
      address: [null, Validators.required],
      phone: [null, Validators.required],
      zipCode: [null, Validators.required],

      // Dirección Postal
      postalAddress: [null, Validators.required],
      postalZipCode: [null, Validators.required],
      postalCity: [null, Validators.required],
      postalRegion: [null, Validators.required],

      // Datos del Contacto
      firstName: [null, Validators.required],
      middleName: [null],
      fatherLastName: [null, Validators.required],
      motherLastName: [null],

      // Datos del Administrador
      email: [null, Validators.email],
      administrationTitle: [null],

      // Monitor
      monitor: [null],
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
    this._geoService.cities$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (result.body.data) {
        this.listCities = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    this._geoService.regions$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (result.body.data) {
        this.listRegions = result.body.data;
        this.listPostalRegions = result.body.data;
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
      if (result.body.data) {
        this.listAgencyStatus = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    this._agencyService.agency$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (result.body) {
        this.onSetForm(result.body);
        this._changeDetectorRef.detectChanges();
      }
    });

    this._usersService.users$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (result.body) {
        this.listUsers = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
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
      latitude: param.latitude || null,
      longitude: param.longitude || null,
      // Dirección Postal
      postalAddress: param.postalAddress || null,
      postalZipCode: param.postalZipCode || null,
      postalCity: param.postalCity || null,
      postalRegion: param.postalRegion || null,
      // Datos del Contacto
      firstName: param.user.firstName || null,
      middleName: param.user.middleName || null,
      fatherLastName: param.user.fatherLastName || null,
      motherLastName: param.user.motherLastName || null,
      email: param.email || null,
      phone: param.phone || null,
      administrationTitle: param.user.administrationTitle || null,
      monitor: param.monitor || null,
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
      sdrNumber: formValues.sdrNumber,
      uieNumber: formValues.uieNumber,
      einNumber: formValues.einNumber,
      address: formValues.address,
      zipCode: formValues.zipCode,
      postalAddress: formValues.postalAddress,
      email: formValues.email,
      phone: formValues.phone,
      administrationTitle: formValues.administrationTitle,
      programs: formValues.program ? [formValues.program.id] : [],
      monitorId: formValues.monitor ? formValues.monitor.id : null,
      assignedBy: assignedBy,
    };

    // Parámetros de consulta
    const queryParams: QueryParameters = {
      agencyId: this.param.id,
    };

    // Llamar al servicio para actualizar
    this._agencyService.updateAgency(agencyRequest, queryParams).subscribe({
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
        } else {
          this._fuseConfirmationService.open({
            title: this._translocoService.translate('dialog.error.title'),
            icon: {
              show: true,
              name: 'heroicons_outline:x-circle',
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
        }
      },
      error: (error) => {
        console.error('Error al actualizar la agencia:', error);
        this.headerConfig.formGroup.enable();
      },
      complete: () => {
        console.log('Actualización completada');
        this.headerConfig.formGroup.enable();

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
        const queryParams: QueryParameters = {
          agencyId: this.param.id,
        };

        this._agencyService.getAgencyById(queryParams).subscribe();
      },
    });
  }

  /**
   * Rechaza la agencia
   */
  onReject() {
    this.showRejectDialog();
    // const queryParams: QueryParameters = {
    //   agencyId: this.param.id,
    //   statusId: 6, // Suponiendo que 6 es el ID para rechazar la agencia
    //   rejectionJustification: 'La solicitud ha sido rechazada debido a la falta de documentación necesaria.',
    // };

    // this._agencyService.updateAgencyStatus(queryParams).subscribe({
    //   next: (response) => {
    //     if (response.body) {
    //       this._fuseConfirmationService.open({
    //         title: this._translocoService.translate('dialog.reject.title'),
    //         icon: {
    //           show: true,
    //           name: 'heroicons_outline:check-circle',
    //           color: 'success',
    //         },
    //         message: this._translocoService.translate('dialog.reject.message'),
    //         actions: {
    //           confirm: {
    //             label: this._translocoService.translate('dialog.reject.confirm'),
    //           },
    //           cancel: {
    //             show: false,
    //           },
    //         },
    //       });
    //     }
    //   },
    //   error: (error) => {
    //     this._fuseConfirmationService.open({
    //       title: this._translocoService.translate('dialog.error.title'),
    //       icon: {
    //         show: true,
    //         name: 'heroicons_outline:exclamation-circle',
    //         color: 'warn',
    //       },
    //       message: 'Ocurrió un error al rechazar la agencia. Por favor, inténtelo de nuevo más tarde.',
    //       actions: {
    //         confirm: {
    //           label: 'Aceptar',
    //         },
    //         cancel: {
    //           show: false,
    //         },
    //       },
    //     });
    //     console.error(error);
    //   },
    //   complete: () => {
    //     const queryParams: QueryParameters = {
    //       agencyId: this.param.id,
    //     };

    //     this._agencyService.getAgencyById(queryParams).subscribe();
    //   },
    // });
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
          error: (error) => {
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
            console.error(error);
          },
          complete: () => {
            this._agencyService.getAgencyById({ agencyId: this.param.id }).subscribe();
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
      complete: () => {
        console.log('Regiones cargadas con éxito');
      },
    });
  }

  // Función única para comparar diferentes tipos de elementos
  compareItems<T>(item1: T, item2: T): boolean {
    return compareByProperty(item1, item2, 'id' as keyof T);
  }
}
