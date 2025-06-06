import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-agency-programs',
    templateUrl: './programs.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class AgencyProgramsComponent { }
