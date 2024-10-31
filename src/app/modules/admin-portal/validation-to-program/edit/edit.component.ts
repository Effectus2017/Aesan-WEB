import { TextFieldModule } from '@angular/cdk/text-field';
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
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
import { TranslocoModule } from '@ngneat/transloco';
import { AgencyService } from 'app/shared/services/agency.service';
import { Agency } from 'app/shared/models/Agency';
import { GeoService } from 'app/shared/services/geo.service';
import { UserService } from 'app/shared/services/user.service';

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
    TranslocoModule,
  ],
})
export class ValidationToProgramEditComponent implements OnInit, OnDestroy, OnGenericHeaderHandlers, OnGenericEditComponentHandler {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  private _formBuilder = inject(UntypedFormBuilder);
  private _agencyService = inject(AgencyService);
  private _geoService = inject(GeoService);
  private _userService = inject(UserService);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  listAgencyStatus = [];
  listPrograms = [];
  listCities = [];
  listRegions = [];

  headerConfig: GenericHeaderConfig = {
    title: 'validation-to-program.edit.title',
    formGroup: this._formBuilder.group({
      name: [{ value: null }],
      program: [{ value: null }],
      status: [''],

      // Datos de la Agencia
      uieNumber: [{ value: null }],
      sdrNumber: [{ value: null }],
      einNumber: [{ value: null }],

      // Datos de la Ciudad y Región
      city: [],
      region: [],
      latitude: [{ value: null }],
      longitude: [{ value: null }],

      // Dirección y Coordenadas
      address: [{ value: null }],
      phone: [{ value: null }],
      zipCode: [{ value: null }],
      postalAddress: [{ value: null }],

      // Datos del Contacto
      firstName: [{ value: null }],
      middleName: [{ value: null }],
      fatherLastName: [{ value: null }],
      motherLastName: [{ value: null }],

      // Datos del Administrador
      email: [{ value: null }],
      adminTitle: [{ value: null }],
    }),
    submitButtonText: 'validation-to-program.edit.submit',
    submitButtonShow: true,
    cancelButtonText: 'validation-to-program.edit.cancel',
    cancelButtonShow: true,
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
        this._changeDetectorRef.detectChanges();
      }
    });

    this._userService.programs$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
      if (result.body.data) {
        this.listPrograms = result.body.data;
        this._changeDetectorRef.detectChanges();
      }
    });

    this._agencyService.agencyStatus$.pipe(takeUntil(this._unsubscribeAll)).subscribe((result: any) => {
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
  }

  ngOnDestroy(): void {
    // Desuscribirse de todas las suscripciones
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSetForm(param: Agency) {
    console.log(param);
    this.headerConfig.formGroup.patchValue({
      name: param.name,
      city: param.city,
      region: param.region,
      program: param.program,
      status: param.status,
      sdrNumber: param.sdrNumber,
      uieNumber: param.uieNumber,
      einNumber: param.einNumber,
      address: param.address,
      postalCode: param.postalCode,
      latitude: param.latitude,
      longitude: param.longitude,
      firstName: param.user.firstName,
      middleName: param.user.middleName,
      fatherLastName: param.user.fatherLastName,
      motherLastName: param.user.motherLastName,
      email: param.email,
      phone: param.phone,
      adminTitle: param.user.administrationTitle,
    });
  }

  onUpdate(param: any) {
    console.log(param);
  }

  compareCity(city1: any, city2: any): boolean {
    return city1 && city2 ? city1.id === city2.id : city1 === city2;
  }

  compareRegion(region1: any, region2: any): boolean {
    return region1 && region2 ? region1.id === region2.id : region1 === region2;
  }

  compareProgram(program1: any, program2: any): boolean {
    return program1 && program2 ? program1.id === program2.id : program1 === program2;
  }

  compareStatus(status1: any, status2: any): boolean {
    return status1 && status2 ? status1.id === status2.id : status1 === status2;
  }
}
