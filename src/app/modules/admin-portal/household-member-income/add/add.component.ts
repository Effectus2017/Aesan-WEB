import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { HouseholdMemberIncomeService } from 'app/shared/services/household-member-income.service';

@Component({
  selector: 'app-household-member-income-add',
  templateUrl: './add.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdMemberIncomeAddComponent implements OnDestroy {
  form: FormGroup;
  loading = false;
  private _destroy$ = new Subject<void>();

  constructor(
    private _formBuilder: FormBuilder,
    private _service: HouseholdMemberIncomeService,
    private _customRouterService: CustomRouterService
  ) {
    this.form = this._formBuilder.group({
      memberId: [null, Validators.required],
      incomeTypeId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      frequencyId: [null, Validators.required],
      isActive: [true]
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this._service.add(this.form.value)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => this._customRouterService.navigate(['admin-portal/household-member-income/list']),
        error: () => this.loading = false
      });
  }

  onCancel(): void {
    this._customRouterService.navigate(['admin-portal/household-member-income/list']);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
