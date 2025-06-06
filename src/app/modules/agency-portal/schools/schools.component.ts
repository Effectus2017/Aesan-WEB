import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-schools',
    templateUrl: './schools.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class SchoolsComponent {}
