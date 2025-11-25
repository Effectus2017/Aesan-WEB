import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-message-template',
    templateUrl: './message-template.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class MessageTemplateComponent { }

