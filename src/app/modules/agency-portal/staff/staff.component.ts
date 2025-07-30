import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  imports: []
})
export class StaffComponent {}
