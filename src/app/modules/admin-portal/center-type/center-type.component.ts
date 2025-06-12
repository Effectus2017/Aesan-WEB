import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin-center-type',
    templateUrl: './center-type.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class CenterTypeComponent {}
