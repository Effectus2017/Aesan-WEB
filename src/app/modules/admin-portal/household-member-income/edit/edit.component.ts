import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomRouterService } from 'app/shared/services/custom-router.service';
import { HouseholdMemberIncomeService } from 'app/shared/services/household-member-income.service';

@Component({
  selector: 'app-household-member-income-edit',
  templateUrl: './edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HouseholdMemberIncomeEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  loading = false;
  private _destroy$ = new Subject<void>();
  private id: number;

  constructor(
    private _formBuilder: FormBuilder,
    private _service: HouseholdMemberIncomeService,
    private _customRouterService: CustomRouterService,
    private _route: ActivatedRoute
  ) {
    this.form = this._formBuilder.group({
      id: [null],
      memberId: [null, Validators.required],
      incomeTypeId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0)]],
      frequencyId: [null, Validators.required],
      isActive: [true]
    });
    this.id = +this._route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loading = true;
    this._service.getById(this.id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (data) => {
          this.form.patchValue(data);
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this._service.update(this.form.value)
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
