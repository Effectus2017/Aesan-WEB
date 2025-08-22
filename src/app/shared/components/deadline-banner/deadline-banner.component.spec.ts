import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { DeadlineBannerComponent } from './deadline-banner.component';
import { AgencyService } from 'app/shared/services/agency.service';
import { AuthService } from 'app/core/auth/auth.service';
import { TranslocoService } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';

describe('DeadlineBannerComponent', () => {
  let component: DeadlineBannerComponent;
  let fixture: ComponentFixture<DeadlineBannerComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockAgencyService: jasmine.SpyObj<AgencyService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockTranslocoService: jasmine.SpyObj<TranslocoService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['events'], {
      events: new BehaviorSubject({})
    });
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        root: {
          children: [{
            routeConfig: { path: 'agency-portal' }
          }]
        }
      }
    });
    const agencyServiceSpy = jasmine.createSpyObj('AgencyService', [], {
      agency$: of({
        body: {
          deadlineToCompleteRegistration: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
    });
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserPrograms']);
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['selectTranslate'], {
      selectTranslate: of('5 días para completar el registro')
    });
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [DeadlineBannerComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: AgencyService, useValue: agencyServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TranslocoService, useValue: translocoServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    }).compileComponents();

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockAgencyService = TestBed.inject(AgencyService) as jasmine.SpyObj<AgencyService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockTranslocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    fixture = TestBed.createComponent(DeadlineBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show banner when not in admin portal', () => {
    // Arrange: Set up route to be agency-portal (not admin-portal)
    (mockActivatedRoute.snapshot as any).root.children[0].routeConfig.path = 'agency-portal';
    
    // Act
    component.ngOnInit();
    
    // Assert
    expect(component.isAdminPortal).toBeFalse();
    expect(component.showBanner).toBeTrue();
  });

  it('should hide banner when in admin portal', () => {
    // Arrange: Set up route to be admin-portal
    (mockActivatedRoute.snapshot as any).root.children[0].routeConfig.path = 'admin-portal';
    
    // Act
    component.ngOnInit();
    
    // Assert
    expect(component.isAdminPortal).toBeTrue();
    expect(component.showBanner).toBeFalse();
  });

  it('should update banner visibility when route changes', () => {
    // Arrange: Start in agency portal
    (mockActivatedRoute.snapshot as any).root.children[0].routeConfig.path = 'agency-portal';
    component.ngOnInit();
    expect(component.showBanner).toBeTrue();

    // Act: Change to admin portal
    (mockActivatedRoute.snapshot as any).root.children[0].routeConfig.path = 'admin-portal';
    component['_checkCurrentRoute']();

    // Assert
    expect(component.isAdminPortal).toBeTrue();
    expect(component.showBanner).toBeFalse();
  });
});
