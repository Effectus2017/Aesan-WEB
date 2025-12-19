import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [RouterOutlet]
})
export class ReportsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

