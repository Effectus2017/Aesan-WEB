import { Component, Inject, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@ngneat/transloco';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SchoolService } from '../../../../shared/services/school.service';
import { SchoolRequest } from "app/shared/models/Request/SchoolRequest";
import { AuthService } from '../../../../core/auth/auth.service';
import { QueryParameters } from '../../../../shared/models/QueryParameters';
import { DisableIfNoPermissionDirective } from 'app/shared/directives/disable-if-no-permission/disable-if-no-permission.directive';

@Component({
  selector: 'app-add-center-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    TranslocoModule,
    DisableIfNoPermissionDirective
],
  templateUrl: './add-center-modal.component.html'
})
export class AddCenterModalComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _formBuilder = inject(FormBuilder);
  private _schoolService = inject(SchoolService);
  private _authService = inject(AuthService);
  private _changeDetectorRef = inject(ChangeDetectorRef);

  // Form
  centerForm: FormGroup;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<AddCenterModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.centerForm = this._formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onSave(): void {
    if (this.centerForm.valid && !this.loading) {
      this.loading = true;

      const name = this.centerForm.get('name')?.value;

      const schoolRequest: SchoolRequest = {
        agencyId: this._authService.getAgencyId(),
        name: name,
        isActive: true
      };

      const queryParameters: QueryParameters = {};

      this._schoolService.insertSchool(schoolRequest, queryParameters)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (response) => {
            this.loading = false;
            this.dialogRef.close(response);
            this._changeDetectorRef.markForCheck();
          },
          error: (error) => {
            console.error('Error creating center:', error);
            // TODO: Show user-friendly error message
            this.loading = false;
            this._changeDetectorRef.markForCheck();
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

