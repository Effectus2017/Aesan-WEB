import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-users-agency',
  templateUrl: './users-agency.component.html',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet],
})
export class UsersAgencyComponent {}
