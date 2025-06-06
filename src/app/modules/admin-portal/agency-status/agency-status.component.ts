import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-agency-status',
    templateUrl: './agency-status.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class AgencyStatusComponent { }
