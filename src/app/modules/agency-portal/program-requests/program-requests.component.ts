import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-agency-program-requests',
    templateUrl: './program-requests.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class AgencyProgramRequestsComponent { }
