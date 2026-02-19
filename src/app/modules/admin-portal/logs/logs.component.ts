import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-logs',
  templateUrl: './logs.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet],
})
export class LogsComponent {}
