import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { fuseAnimations } from '@fuse/animations';
import { RouterLink, RouterModule } from '@angular/router';
import { GenericHeaderConfig, OnGenericHeaderHandlers } from './generic-header.interface';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-generic-header',
  templateUrl: './generic-header.component.html',
  standalone: true,
  animations: fuseAnimations,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, NgIf, RouterModule, RouterLink, TranslocoModule],
})
export class GenericHeaderComponent {
  @Input() config: GenericHeaderConfig;
  @Input() handler: OnGenericHeaderHandlers;

  // Search Field config
  @Input() searchFieldShow: boolean = false;
  @Input() searchInputPlaceholder: string = 'Search'; // TODO: Change this to the correct translation key

  // Go to Add Button config
  @Input() goToAddButtonShow: boolean = false;

  // Cancel Button config
  @Input() cancelButtonShow: boolean = false;
  @Input() cancelButtonText: string = 'Cancel'; // TODO: Change this to the correct translation key

  // Submit Button config
  @Input() submitButtonShow: boolean = false;
  @Input() submitButtonText: string = 'Create'; // TODO: Change this to the correct translation key
  @Input() submitLoadingText: string = 'Creating...'; // TODO: Change this to the correct translation key

  // Save Button config
  @Input() saveButtonShow: boolean = false;
  @Input() saveButtonText: string = 'Save'; // TODO: Change this to the correct translation key

  // Clear Button config
  @Input() clearVisible: boolean = false;

  // Loading config
  @Input() isLoading: boolean = false;

  // Outputs
//   @Output() clean = new EventEmitter<Event>();
//   @Output() submit = new EventEmitter<void>();
//   @Output() cancel = new EventEmitter<void>();
//   @Output() save = new EventEmitter<void>();

  onSubmit() {
    this.handler.onSubmit();
  }

  onCancel(event: Event) {
    this.handler.onCancel(event);
  }

  onSave() {
    this.handler.onSave();
  }

  onReject() {
    this.handler.onReject();
  }
}
