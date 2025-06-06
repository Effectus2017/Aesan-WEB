import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-agency-forms',
    templateUrl: './forms.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class AgencyFormsComponent {}
