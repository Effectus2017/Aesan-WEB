import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-option-selection',
    templateUrl: './option-selection.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports    : [RouterOutlet],
})
export class OptionSelectionComponent { }
