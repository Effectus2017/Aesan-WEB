import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-staff-type',
    templateUrl: './staff-type.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class StaffTypeComponent { }
