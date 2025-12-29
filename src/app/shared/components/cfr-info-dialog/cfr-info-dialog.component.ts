import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@ngneat/transloco';
import { NgIf } from '@angular/common';

export interface CfrInfoData {
  title: string;
  message: string;
  cfrLink?: {
    url: string;
    text: string;
  };
}

@Component({
  selector: 'app-cfr-info-dialog',
  templateUrl: './cfr-info-dialog.component.html',
  styleUrls: ['./cfr-info-dialog.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
    NgIf
  ]
})
export class CfrInfoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CfrInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CfrInfoData,
  ) {}
}
