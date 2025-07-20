import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: []
})
export class EmployeesComponent {}
