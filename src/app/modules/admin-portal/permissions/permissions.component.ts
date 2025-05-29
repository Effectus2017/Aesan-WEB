import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-permissions',
    templateUrl: './permissions.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports    : [RouterOutlet],
})
export class PermissionsComponent { }
