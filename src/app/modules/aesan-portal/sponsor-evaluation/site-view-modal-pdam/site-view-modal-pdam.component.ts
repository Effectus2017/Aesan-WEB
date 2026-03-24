import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { NgFor, NgIf } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { Site } from 'app/shared/models/site/Site';
import { SiteEditModalData } from 'app/shared/models/response/SiteEditModalData';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';
import { normalizeTime } from 'app/shared/utils';

/**
 * Modal de solo lectura para ver datos de un sitio (PDAM).
 * Usa FormGroup + patchValue como el formulario de edición; los controles van deshabilitados.
 */
@Component({
  selector: 'app-site-view-modal-pdam',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    TranslocoModule,
    NgIf,
    NgFor,
    DynamicGridDirective,
  ],
  templateUrl: './site-view-modal-pdam.component.html',
})
export class SiteViewModalPdamComponent implements OnInit, OnDestroy {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll = new Subject<void>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _formBuilder = inject(FormBuilder);
  private _translocoService = inject(TranslocoService);

  // -----
  // @ Variables
  // -----
  currentLang: string = 'es';

  /** Opciones Sí/No (igual que en sites-pdam/edit). */
  yesNoOptions: { booleanValue: boolean; name: string; nameEN: string }[] = [];

  /** Formulario de solo lectura; se rellena con patchValue al recibir data.site (igual que edit). */
  form: FormGroup = this._formBuilder.group({
    siteCode: [''],
    name: [''],
    address: [''],
    city: [null],
    region: [null],
    zipCode: [''],
    latitude: [null],
    longitude: [null],
    sameAsPhysicalAddress: [false],
    postalAddress: [''],
    postalCity: [null],
    postalRegion: [null],
    postalZipCode: [''],
    areaType: [null],
    locationType: [null],
    nonProfit: [null],
    generalEnrollment: [null],
    startDate: [null],
    baseYear: [null],
    renewalYear: [null],
    operatingPolicy: [null],
    educationLevels: [[]],
    organizationType: [null],
    typeOfResidential: [null],
    centerType: [null],
    operatingFromDate: [null],
    operatingToDate: [null],
    operatingDaysCalculated: [null],
    operatingDaysOfWeek: [[]],
    operatingStartTime: [null],
    operatingEndTime: [null],
    firstAcademicClassStartTime: [null],
    lastAcademicClassEndTime: [null],
    serviceTime: [null],
    sponsorType: [null],
    groupType: [null],
    siteLocation: [null],
    deliveryType: [null],
    kitchenType: [null],
    typeOfApplicant: [null],
    hasWarehouse: [null],
    hasDiningRoom: [null],
    diningRoomCapacity: [null],
    personInCharge: this._formBuilder.group({
      firstName: [''],
      middleName: [''],
      fatherLastName: [''],
      motherLastName: [''],
      sitePhone: [''],
      extension: [''],
      mobilePhone: [''],
    }),
    reviewResult: [null],
    reviewDate: [null],
    reviewJustification: [null],
  });

  // -----
  // @ Constructor
  // -----
  constructor(
    public dialogRef: MatDialogRef<SiteViewModalPdamComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteEditModalData
  ) {}

  // -----
  // @ Getters
  // -----
  get site(): Site {
    return this.data.site;
  }

  /** Muestra el nombre según idioma para opciones con name/nameEN. */
  optionName(obj: { name?: string; nameEN?: string } | null | undefined): string {
    if (!obj) return '';
    return this.currentLang === 'es' ? (obj.name ?? obj.nameEN ?? '') : (obj.nameEN ?? obj.name ?? '');
  }

  get educationLevelsDisplay(): string {
    const levels = (this.form.get('educationLevels')?.value ?? []) as { name?: string; nameEN?: string }[];
    return levels.map((e) => this.optionName(e)).filter(Boolean).join(', ');
  }

  get operatingDaysOfWeekDisplay(): string {
    const days = (this.form.get('operatingDaysOfWeek')?.value ?? []) as { name?: string; nameEN?: string }[];
    return days.map((d) => this.optionName(d)).filter(Boolean).join(', ');
  }

  get shouldShowProvisionFields(): boolean {
    const id = (this.form.get('operatingPolicy')?.value as { id?: number } | null)?.id;
    return id === 3 || id === 4 || id === 5;
  }

  get shouldShowCenterTypeField(): boolean {
    const org = this.form.get('organizationType')?.value as { requiresCenterType?: boolean } | null;
    return org?.requiresCenterType === true;
  }

  get shouldShowKitchenTypeField(): boolean {
    const gt = this.form.get('groupType')?.value as { code?: string } | null;
    return gt?.code === 'DINING_ROOM';
  }

  get applicantDisplay(): string {
    const obj = this.form.get('typeOfApplicant')?.value;
    return this.optionName(obj);
  }

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----
  ngOnInit(): void {
    this.currentLang = this._translocoService.getActiveLang();
    this.yesNoOptions = [
      { booleanValue: true, name: this._translocoService.translate('global.listFilters.yes', {}, 'es'), nameEN: this._translocoService.translate('global.listFilters.yes', {}, 'en') },
      { booleanValue: false, name: this._translocoService.translate('global.listFilters.no', {}, 'es'), nameEN: this._translocoService.translate('global.listFilters.no', {}, 'en') },
    ];
    this._translocoService.langChanges$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lang: string) => {
        this.currentLang = lang;
      });
    this.onSetForm(this.data.site);
    this.form.disable();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Otras funciones públicas
  // -----
  /**
   * Rellena el formulario con los datos del sitio (mismo nombre y criterio que onSetForm en sites-pdam/edit).
   */
  /** Convierte string de fecha (ISO o YYYY-MM-DD) a Date para los controles de mat-datepicker. */
  private parseDate(value: string | Date | null | undefined): Date | null {
    if (value == null) return null;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  onSetForm(param: Site): void {
    const city = param.city;
    const region = param.region;
    const postalCity = param.postalCity;
    const postalRegion = param.postalRegion;
    const applicantType = param.applicantType ?? (param as any).typeOfApplicant;
    this.form.patchValue({
      siteCode: param.siteCode ?? param.id?.toString() ?? '',
      name: param.name,
      address: param.address ?? null,
      city: city ?? null,
      region: region ?? null,
      zipCode: param.zipCode,
      latitude: param.latitude ?? null,
      longitude: param.longitude ?? null,
      sameAsPhysicalAddress: param.sameAsPhysicalAddress ?? false,
      postalAddress: param.postalAddress ?? '',
      postalCity: postalCity ?? null,
      postalRegion: postalRegion ?? null,
      postalZipCode: param.postalZipCode ?? '',
      areaType: param.areaType ?? null,
      locationType: param.locationType ?? null,
      nonProfit: param.nonProfit ?? null,
      generalEnrollment: param.generalEnrollment ?? null,
      startDate: this.parseDate(param.startDate as string | null) ?? null,
      baseYear: param.baseYear ?? null,
      renewalYear: param.renewalYear ?? null,
      operatingPolicy: param.operatingPolicy ?? null,
      educationLevels: param.educationLevels ?? [],
      organizationType: param.organizationType ?? null,
      typeOfResidential: param.residentialType ?? null,
      centerType: param.centerType ?? null,
      operatingFromDate: this.parseDate(param.operatingFromDate as string | null) ?? null,
      operatingToDate: this.parseDate(param.operatingToDate as string | null) ?? null,
      operatingDaysCalculated: param.operatingDaysCalculated ?? null,
      operatingDaysOfWeek: param.operatingDaysOfWeek ?? [],
      operatingStartTime: param.operatingStartTime != null ? normalizeTime(String(param.operatingStartTime)) : null,
      operatingEndTime: param.operatingEndTime != null ? normalizeTime(String(param.operatingEndTime)) : null,
      firstAcademicClassStartTime: param.firstAcademicClassStartTime != null ? normalizeTime(String(param.firstAcademicClassStartTime)) : null,
      lastAcademicClassEndTime: param.lastAcademicClassEndTime != null ? normalizeTime(String(param.lastAcademicClassEndTime)) : null,
      serviceTime: this.parseDate(param.serviceTime as string | null) ?? param.serviceTime ?? null,
      sponsorType: param.sponsorType ?? null,
      groupType: param.groupType ?? null,
      siteLocation: param.siteLocation ?? null,
      deliveryType: param.deliveryType ?? null,
      kitchenType: param.kitchenType ?? null,
      typeOfApplicant: applicantType ?? null,
      hasWarehouse: param.hasWarehouse ?? null,
      hasDiningRoom: param.hasDiningRoom ?? null,
      diningRoomCapacity: param.diningRoomCapacity ?? null,
      personInCharge: param.personInCharge
        ? {
            firstName: param.personInCharge.firstName ?? '',
            middleName: param.personInCharge.middleName ?? '',
            fatherLastName: param.personInCharge.fatherLastName ?? '',
            motherLastName: param.personInCharge.motherLastName ?? '',
            sitePhone: param.personInCharge.sitePhone ?? '',
            extension: param.personInCharge.extension ?? '',
            mobilePhone: param.personInCharge.mobilePhone ?? '',
          }
        : {
            firstName: '',
            middleName: '',
            fatherLastName: '',
            motherLastName: '',
            sitePhone: '',
            extension: '',
            mobilePhone: '',
          },
      reviewResult: (param as any).reviewResult ?? null,
      reviewDate: this.parseDate(param.reviewDate as string | null) ?? param.reviewDate ?? null,
      reviewJustification: param.reviewJustification ?? null,
    });
  }

  // -----
  // @ Funciones On (componentes genéricos)
  // -----
  onClose(): void {
    this.dialogRef.close(null);
  }
}
