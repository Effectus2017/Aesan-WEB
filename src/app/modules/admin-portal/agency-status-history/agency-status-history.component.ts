import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-agency-status-history',
  templateUrl: './agency-status-history.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet],
})
export class AgencyStatusHistoryComponent {}
