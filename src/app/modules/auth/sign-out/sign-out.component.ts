import { I18nPluralPipe, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';

@Component({
    selector: 'auth-sign-out',
    templateUrl: './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [NgIf, RouterLink, I18nPluralPipe, TranslocoModule]
})
export class AuthSignOutComponent implements OnInit, OnDestroy
{
    countdown: number = 5;
    countdownMapping: any = {
        '=1'   : '# second',
        'other': '# seconds',
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _translocoService = inject(TranslocoService);

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Initialize countdown mapping with translations
        this._updateCountdownMapping();

        // Sign out
        this._authService.signOut();

        // Redirect after the countdown
        timer(1000, 1000)
            .pipe(
                finalize(() =>
                {
                    this._router.navigate(['sign-in']);
                }),
                takeWhile(() => this.countdown > 0),
                takeUntil(this._unsubscribeAll),
                tap(() => this.countdown--),
            )
            .subscribe();
    }

    /**
     * Update countdown mapping with current language translations
     */
    private _updateCountdownMapping(): void
    {
        this.countdownMapping = {
            '=1'   : this._translocoService.translate('sign-out.countdown.second'),
            'other': this._translocoService.translate('sign-out.countdown.seconds'),
        };
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
