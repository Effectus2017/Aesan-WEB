import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-kitchen-type',
    templateUrl: './kitchen-type.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports    : [RouterOutlet],
})
export class KitchenTypeComponent { }
