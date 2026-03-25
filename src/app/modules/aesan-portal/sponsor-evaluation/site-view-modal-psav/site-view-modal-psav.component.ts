import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { NgIf } from '@angular/common';

import { OptionSelection } from 'app/shared/models/common/OptionSelection';
import { Site } from 'app/shared/models/site/Site';
import { SiteEditModalData } from 'app/shared/models/response/SiteEditModalData';
import { DynamicGridDirective } from 'app/shared/directives/dynamic-grid.directive';

/** Sitio en vista PSAV: la API puede devolver el catálogo resuelto además de `reviewResultId`. */
type SitePsavViewRow = Site & { reviewResult?: OptionSelection };

/**
 * Modal de solo lectura para ver datos de un sitio (PSAV).
 * Solo muestra la información recibida en data.site; no edita ni guarda.
 */
@Component({
  selector: 'app-site-view-modal-psav',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslocoModule,
    NgIf,
    DynamicGridDirective,
  ],
  templateUrl: './site-view-modal-psav.component.html',
})
export class SiteViewModalPsavComponent {
  private _translocoService = inject(TranslocoService);

  currentLang: string = 'es';

  constructor(
    public dialogRef: MatDialogRef<SiteViewModalPsavComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteEditModalData
  ) {
    this.currentLang = this._translocoService.getActiveLang();
  }

  get site(): SitePsavViewRow {
    return this.data.site as SitePsavViewRow;
  }

  /** Muestra el nombre según idioma para opciones con name/nameEN. */
  optionName(obj: { name?: string; nameEN?: string } | null | undefined): string {
    if (!obj) return '';
    return this.currentLang === 'es' ? (obj.name ?? obj.nameEN ?? '') : (obj.nameEN ?? obj.name ?? '');
  }

  get educationLevelsDisplay(): string {
    const levels = this.site.educationLevels ?? [];
    return levels.map((e) => this.optionName(e)).filter(Boolean).join(', ');
  }

  /** Campos del representante normalizados para la vista; evita ocultar la sección si la API envía `personInCharge` null. */
  get personInChargeDisplay(): {
    firstName: string;
    middleName: string;
    fatherLastName: string;
    motherLastName: string;
    sitePhone: string;
    extension: string;
    mobilePhone: string;
  } {
    const p = this.site.personInCharge;
    return {
      firstName: p?.firstName ?? '',
      middleName: p?.middleName ?? '',
      fatherLastName: p?.fatherLastName ?? '',
      motherLastName: p?.motherLastName ?? '',
      sitePhone: p?.sitePhone ?? '',
      extension: p?.extension ?? '',
      mobilePhone: p?.mobilePhone ?? '',
    };
  }

  onClose(): void {
    this.dialogRef.close(null);
  }
}
