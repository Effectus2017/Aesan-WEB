import { NgModule } from '@angular/core';
import { NumericOnlyDirective } from './directives/numeric-only.directive';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  imports: [
    TranslocoModule,
    NumericOnlyDirective
  ],
  exports: [
    TranslocoModule,
    NumericOnlyDirective
  ]
})
export class SharedModule {}
