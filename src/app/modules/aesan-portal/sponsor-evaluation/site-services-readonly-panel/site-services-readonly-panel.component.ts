import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { Subject, finalize, takeUntil } from 'rxjs';
import { GenericTableComponent } from 'app/shared/components/generic-table/generic-table.component';
import { GenericTableConfig, OnGenericTableHandler } from 'app/shared/components/generic-table/generic-table.interface';
import { ServiceByGroupDialogResult } from 'app/shared/components/add-service-by-group-modal/add-service-by-group-modal.component';
import { SERVICES_COLUMNS_SCHEMA } from 'app/shared/components/add-service-by-group-modal/services-columns-schema';
import { PROGRAM_CODES, PROGRAM_IDS, getProgramCodeById } from 'app/shared/const';
import { DayOfWeekResponse } from 'app/shared/models/calendar/DayOfWeekResponse';
import { AgencyResponse } from 'app/shared/models/agency/AgencyResponse';
import { ServiceTypeByProgram } from 'app/shared/models/program/ServiceTypeByProgram';
import { SiteChildGroupServiceSlotResponse } from 'app/shared/models/response/SiteChildGroupServiceSlotResponse';
import { SiteResponse } from 'app/shared/models/response/SiteResponse';
import type { SponsorEvaluationSiteViewVariant } from 'app/shared/models/response/SiteEditModalData';
import { QueryParameters } from 'app/shared/models/common/QueryParameters';
import { ServiceTypeService } from 'app/shared/services/service-type.service';

/**
 * Panel de solo lectura: tabla de servicios por grupo (misma lógica que sites-pdam/edit y el modal de servicios).
 */
@Component({
  selector: 'app-site-services-readonly-panel',
  standalone: true,
  imports: [NgIf, MatIconModule, TranslocoModule, GenericTableComponent],
  templateUrl: './site-services-readonly-panel.component.html',
  /** En grids de 12 columnas el host debe ocupar todo el ancho; `min-w-0` evita que flex/grid comprima el contenido. */
  host: {
    class: 'block w-full min-w-0 col-span-12',
  },
})
export class SiteServicesReadonlyPanelComponent implements OnInit, OnDestroy, OnGenericTableHandler {
  // -----
  // @ Subject de desuscripción
  // -----
  private _unsubscribeAll = new Subject<void>();

  // -----
  // @ Inyecciones privadas
  // -----
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _translocoService = inject(TranslocoService);
  private _serviceTypeService = inject(ServiceTypeService);

  // -----
  // @ Variables
  // -----
  /** Sitio con grupos y slots de servicio. */
  @Input({ required: true }) site!: SiteResponse;

  /** Agencia del contexto de evaluación (para resolver programa). */
  @Input() agency?: AgencyResponse;

  /** Variante de programa AESAN (PDAM, PSAV, PACNA). */
  @Input({ required: true }) siteViewVariant!: SponsorEvaluationSiteViewVariant;

  servicesCardLoading = false;
  loadError = false;

  /** Tipos de servicio del programa (misma fuente que programData.serviceTypes en edit agencia). */
  private _serviceTypes: ServiceTypeByProgram[] = [];

  servicesByGroups: ServiceByGroupDialogResult[] = [];

  servicesTableConfig: GenericTableConfig = {
    dataSource: new MatTableDataSource<Record<string, unknown>>([]),
    columnsSchema: SERVICES_COLUMNS_SCHEMA,
    displayedColumns: SERVICES_COLUMNS_SCHEMA.map((col) => col.key as string),
    handler: this,
    showPaginator: true,
    pageSizeOptions: [25, 50, 100],
    pageSize: 25,
    fullScreen: true,
    viewMode: 'cards',
    operatingDaysOfWeek: [],
    addMenuShow: false,
    cardRowMenuShow: false,
    cardGroupHeaderPlacement: 'above',
  };

  // -----
  // @ Getters
  // -----
  /** Requerido por OnGenericTableHandler (tabla de servicios). */
  get tableConfig(): GenericTableConfig {
    return this.servicesTableConfig;
  }

  /** Indica si el sitio trae grupos con servicios. */
  get hasChildGroups(): boolean {
    return !!(this.site.childGroups && this.site.childGroups.length > 0);
  }

  // -----
  // @ ngOnInit / ngOnDestroy
  // -----
  /** Carga tipos de servicio del programa y arma la tabla como en sites-pdam/edit. */
  ngOnInit(): void {
    const site = this.site;
    this.servicesTableConfig.operatingDaysOfWeek = (site.operatingDaysOfWeek ?? []) as DayOfWeekResponse[];

    this._translocoService.langChanges$.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
      this._updateServicesTableDataSource();
      this._changeDetectorRef.markForCheck();
    });

    if (!this.hasChildGroups) {
      return;
    }

    const programId = this._resolveProgramId(this.agency, this.siteViewVariant);
    if (programId == null) {
      this.loadError = true;
      return;
    }

    this.servicesCardLoading = true;
    const qp: QueryParameters = { programId };
    this._serviceTypeService
      .getServiceTypesByProgram(qp)
      .pipe(
        takeUntil(this._unsubscribeAll),
        finalize(() => {
          this.servicesCardLoading = false;
          this._changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (response: unknown) => {
          const raw = response as { body?: ServiceTypeByProgram[] };
          const list = (raw?.body ?? raw ?? []) as ServiceTypeByProgram[];
          this._serviceTypes = Array.isArray(list) ? list : [];
          this.servicesTableConfig.serviceTypes = this._serviceTypes;
          this._buildServicesByGroupsFromSite(site);
          this._updateServicesTableDataSource();
        },
        error: () => {
          this.loadError = true;
        },
      });
  }

  /** Cierra suscripciones. */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----
  // @ Funciones On (componentes genéricos)
  // -----
  /** En modo solo lectura no se añaden filas; no hace nada. */
  onTableAdd(_event?: Event): void {}

  /** En modo solo lectura no se edita; cancela la acción. */
  onTableEdit(event: Event, _id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /** En modo solo lectura no se elimina; cancela la acción. */
  onTableDelete(event: Event, _id: number): void {
    event.stopPropagation();
    event.preventDefault();
  }

  // -----
  // @ Funciones privadas
  // -----
  /** Resuelve el id de programa según la variante AESAN (misma lógica que rutas view-pdam / view-psav / view-pacna). */
  private _resolveProgramId(agency: AgencyResponse | undefined, variant: SponsorEvaluationSiteViewVariant): number | null {
    const programs = agency?.programs ?? [];
    const codeByVariant: Record<SponsorEvaluationSiteViewVariant, string> = {
      pdam: PROGRAM_CODES.PDAM,
      psav: PROGRAM_CODES.PSAV,
      'pacna-centro': PROGRAM_CODES.PACNA,
      'pacna-hogar': PROGRAM_CODES.PACNA,
    };
    const expected = codeByVariant[variant];
    for (const p of programs) {
      if (getProgramCodeById(p.id) === expected) {
        return p.id;
      }
    }
    if (variant === 'pdam') return PROGRAM_IDS.PDAM;
    if (variant === 'psav') return PROGRAM_IDS.PSAV;
    if (variant === 'pacna-centro' || variant === 'pacna-hogar') return PROGRAM_IDS.PACNA;
    return null;
  }

  /** Construye `servicesByGroups` desde `site.childGroups` (igual que onSetForm en sites-pdam/edit). */
  private _buildServicesByGroupsFromSite(param: SiteResponse): void {
    if (!param.childGroups?.length) {
      this.servicesByGroups = [];
      return;
    }
    this.servicesByGroups = param.childGroups.map((group, index) => ({
      id: group.id ?? index + 1,
      groupName: group.groupName,
      numberOfChildren: group.numberOfChildren || 0,
      serviceSlots: (group.serviceSlots ?? []).map((slot: SiteChildGroupServiceSlotResponse) => ({
        serviceTypeId: slot.serviceTypeId,
        isOffered: slot.isOffered,
        from: slot.from ?? slot.fromTime,
        to: slot.to ?? slot.toTime,
        serviceTypeName: slot.serviceTypeName,
        serviceTypeNameEN: slot.serviceTypeNameEN,
        operatingDates: slot.operatingDates ?? [],
      })),
    }));
  }

  /** Mapeo serviceTypeId → clave de columna (mismo criterio que getServiceTypeIdToTableKey en sites-pdam/edit). */
  private _getServiceTypeIdToTableKey(): Record<number, string> {
    const map: Record<number, string> = {};
    if (this._serviceTypes?.length) {
      this._serviceTypes.forEach((st) => {
        const key = st.code.charAt(0).toLowerCase() + st.code.slice(1);
        map[st.id] = key;
      });
    }
    return map;
  }

  /** Rellena `servicesTableConfig.dataSource` (misma lógica que updateServicesTableDataSource en sites-pdam/edit). */
  private _updateServicesTableDataSource(): void {
    const idToKey = this._getServiceTypeIdToTableKey();
    const serviceTypes = this._serviceTypes ?? [];
    const currentLang = this._translocoService?.getActiveLang() ?? 'es';
    const displayRows = this.servicesByGroups.map((row) => {
      const slots = row.serviceSlots ?? [];
      const enrichedSlots = slots.map((slot) => {
        const st = serviceTypes.find((s) => Number(s.id) === Number(slot.serviceTypeId));
        const slotWithName = slot as { serviceTypeName?: string };
        const label =
          slotWithName.serviceTypeName ?? (currentLang === 'es' ? st?.name : st?.nameEN) ?? st?.name ?? st?.code;
        return { ...slot, serviceTypeName: label };
      });
      const booleans: Record<string, boolean> = {};
      const fromTo: Record<string, string | undefined> = {};
      for (const [idStr, key] of Object.entries(idToKey)) {
        const id = Number(idStr);
        const slot = slots.find((s) => s.serviceTypeId === id && s.isOffered);
        booleans[key] = !!slot;
        const s = slot as SiteChildGroupServiceSlotResponse | undefined;
        let fromVal = s?.from ?? s?.fromTime;
        let toVal = s?.to ?? s?.toTime;
        if ((fromVal == null || toVal == null) && s?.operatingDates?.length) {
          const firstWithTimes = (s.operatingDates as { from?: string; to?: string; From?: string; To?: string }[]).find(
            (od) => (od.from ?? od.From) && (od.to ?? od.To),
          );
          if (firstWithTimes) {
            fromVal = fromVal ?? firstWithTimes.from ?? (firstWithTimes as { From?: string }).From;
            toVal = toVal ?? firstWithTimes.to ?? (firstWithTimes as { To?: string }).To;
          }
        }
        if (fromVal != null) {
          fromTo[key + 'From'] = fromVal;
        }
        if (toVal != null) {
          fromTo[key + 'To'] = toVal;
        }
      }
      return { ...row, serviceSlots: enrichedSlots, ...booleans, ...fromTo };
    });
    this.servicesTableConfig.dataSource.data = displayRows;
    this._changeDetectorRef.detectChanges();
  }
}
