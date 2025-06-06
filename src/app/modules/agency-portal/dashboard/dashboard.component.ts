import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-agency-dashboard',
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        RouterModule
    ]
})
export class AgencyDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
