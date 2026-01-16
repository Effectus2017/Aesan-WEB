import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin-email-logs',
    templateUrl: './email-logs.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class EmailLogsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
