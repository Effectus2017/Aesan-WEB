import { NgModule } from '@angular/core';
import { NumericOnlyDirective } from './directives/numeric-only.directive';

@NgModule({
  declarations: [NumericOnlyDirective],
  exports: [NumericOnlyDirective]
})
export class SharedModule {}
