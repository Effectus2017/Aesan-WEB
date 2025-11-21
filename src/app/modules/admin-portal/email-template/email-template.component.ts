import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-email-template',
    templateUrl: './email-template.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class EmailTemplateComponent { }

