import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';

export interface PermissionRequestDialogData {
  deliveryTypeName: string;
  deliveryTypeNameEN: string;
}

@Component({
  selector: 'app-permission-request-dialog',
  templateUrl: './permission-request-dialog.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule
  ]
})
export class PermissionRequestDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PermissionRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PermissionRequestDialogData
  ) {}

  onYes(): void {
    this.dialogRef.close('yes');
  }

  onNo(): void {
    this.dialogRef.close('no');
  }
}
