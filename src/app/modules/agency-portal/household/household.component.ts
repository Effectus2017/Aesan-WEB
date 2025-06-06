import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'agency-portal-household',
    templateUrl: './household.component.html',
    imports: [RouterOutlet],
    encapsulation: ViewEncapsulation.None
})
export class HouseholdComponent {}
