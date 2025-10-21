import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-aesan-dashboard',
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        RouterModule
    ]
})
export class AesanDashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
