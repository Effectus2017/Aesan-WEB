import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-generic-header',
  templateUrl: './generic-header.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, NgIf],
})
export class GenericHeaderComponent {
  @Input() title: string;
  @Input() formGroup: FormGroup;
  @Input() clearVisible: boolean = false;

  @Output() clear = new EventEmitter<Event>();
  @Output() submit = new EventEmitter<void>();
}
