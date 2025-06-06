import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-organization-type',
    templateUrl: './organization-type.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class OrganizationTypeComponent {}
