import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-monitor-preoperational-visit',
    templateUrl: './preoperational-visit.component.html',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports    : [RouterOutlet],
})
export class MonitorPreoperationalVisitComponent { }
