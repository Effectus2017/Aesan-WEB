import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'agency-portal-legibility-module',
  templateUrl: './legibility.component.html',
  standalone: true,
  imports: [RouterOutlet],
  encapsulation: ViewEncapsulation.None,
})
export class ReadabilityModuleComponent {}
