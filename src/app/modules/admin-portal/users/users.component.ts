import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin-users',
    templateUrl: './users.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})
export class UsersComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
