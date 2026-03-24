import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { NgIf } from '@angular/common';

import { Site } from 'app/shared/models/site/Site';
import { SiteEditModalData } from 'app/shared/models/response/SiteEditModalData';

/**
 * Modal de solo lectura para ver datos de un sitio PACNA (hogar / Day Care Home).
 * Solo muestra información básica y dirección; no edita ni guarda.
 */
@Component({
  selector: 'app-site-view-modal-pacna-hogar',
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
  ],
  templateUrl: './site-view-modal-pacna-hogar.component.html',
})
export class SiteViewModalPacnaHogarComponent {
  private _translocoService = inject(TranslocoService);

  currentLang: string = 'es';

  constructor(
    public dialogRef: MatDialogRef<SiteViewModalPacnaHogarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteEditModalData
  ) {
    this.currentLang = this._translocoService.getActiveLang();
  }

  get site(): Site {
    return this.data.site;
  }

  onClose(): void {
    this.dialogRef.close(null);
  }
}
