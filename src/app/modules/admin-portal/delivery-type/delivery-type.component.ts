import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-delivery-type',
  templateUrl: './delivery-type.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports    : [RouterOutlet],
})
export class DeliveryTypeComponent {}
