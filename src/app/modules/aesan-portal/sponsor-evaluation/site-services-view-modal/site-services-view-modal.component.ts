import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { SiteServicesReadonlyPanelComponent } from '../site-services-readonly-panel/site-services-readonly-panel.component';
import { SiteServicesViewModalData } from './site-services-view-modal-data.interface';

/**
 * Modal de solo lectura: tabla de servicios por grupo, mismo bloque que en portal agencia (sites-pdam/edit).
 */
@Component({
  selector: 'app-site-services-view-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslocoModule, SiteServicesReadonlyPanelComponent],
  templateUrl: './site-services-view-modal.component.html',
})
export class SiteServicesViewModalComponent {
  // -----
  // @ Constructor
  // -----
  /** Inyecta datos del diálogo y la referencia al MatDialogRef. */
  constructor(
    public dialogRef: MatDialogRef<SiteServicesViewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SiteServicesViewModalData,
  ) {}

  // -----
  // @ Otras funciones públicas
  // -----
  /** Cierra el diálogo. */
  onClose(): void {
    this.dialogRef.close(null);
  }
}
