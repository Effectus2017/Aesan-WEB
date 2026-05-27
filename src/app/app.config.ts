import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling, withPreloading, withRouterConfig } from '@angular/router';
import { provideFuse } from '@fuse';
import { provideTransloco, TranslocoService } from '@ngneat/transloco';
import { firstValueFrom } from 'rxjs';
import { appRoutes } from 'app/app.routes';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideIcons } from 'app/core/icons/icons.provider';
import { mockApiServices } from 'app/mock-api';
import { TranslocoBundleLoaderService } from './core/transloco/transloco-bundle-loader.service';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';
import { isNullOrUndefinedEmptyStringNullArray } from './shared/utils';
import { provideToastr, ToastrModule } from 'ngx-toastr';
import { environment } from '../environments/environment';
import { CalendarModule, DateAdapter as CalendarDateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';
import { provideHttpClientWithInterceptors } from './core/http/http.config';
import { SelectivePreloadingStrategy } from './core/router/selective-preloading.strategy';
import type { FuseConfig } from '@fuse/services/config';

// Registrar locales para Angular
registerLocaleData(localeEs, 'es');
registerLocaleData(localeEn, 'en');

const fuseUiConfig: FuseConfig = {
  layout: 'modern', //'compact',
  scheme: 'light',
  screens: {
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1440px',
  },
  theme: 'theme-default',
  themes: [
    {
      id: 'theme-default',
      name: 'Default',
    },
    {
      id: 'theme-brand',
      name: 'Brand',
    },
    {
      id: 'theme-teal',
      name: 'Teal',
    },
    {
      id: 'theme-rose',
      name: 'Rose',
    },
    {
      id: 'theme-purple',
      name: 'Purple',
    },
    {
      id: 'theme-amber',
      name: 'Amber',
    },
  ],
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    // Configuración consolidada de HTTP Client con todos los interceptores
    provideHttpClientWithInterceptors(),

    provideRouter(
        appRoutes,
        withPreloading(SelectivePreloadingStrategy),
        withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
        withRouterConfig({
            onSameUrlNavigation: 'reload',
            paramsInheritanceStrategy: 'always',
            urlUpdateStrategy: 'eager'
          })
    ),

    // Material Date Adapter
    {
      provide: DateAdapter,
      useClass: LuxonDateAdapter,
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'D',
          timeInput: 'HH:mm',
        },
        display: {
          dateInput: 'DDD',
          monthYearLabel: 'LLL yyyy',
          dateA11yLabel: 'DD',
          monthYearA11yLabel: 'LLLL yyyy',
          timeInput: 'HH:mm',
          timeOptionLabel: 'HH:mm',
        },
      },
    },

    // Transloco Config
    provideTransloco({
      config: {
        availableLangs: [
          {
            id: 'en',
            label: 'English',
          },
          {
            id: 'es',
            label: 'Español',
          },
        ],
        defaultLang: 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      },
      loader: TranslocoHttpLoader,
    }),
    {
      // Preload the default language before the app starts to prevent empty/jumping content
      provide: APP_INITIALIZER,
      useFactory: () => {
        const translocoService = inject(TranslocoService);
        if (isNullOrUndefinedEmptyStringNullArray(localStorage.getItem('language'))) {
          localStorage.setItem('language', 'es');
          translocoService.setDefaultLang('es');
        } else {
          translocoService.setDefaultLang(localStorage.getItem('language'));
        }
        // Set the active language
        const defaultLang = translocoService.getDefaultLang();
        translocoService.setActiveLang(defaultLang);

        return () => firstValueFrom(translocoService.load(defaultLang));
      },
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        inject(TranslocoBundleLoaderService);
        return () => undefined;
      },
    },

    importProvidersFrom(ToastrModule.forRoot()),

    // Angular Calendar - Configuración según documentación
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: CalendarDateAdapter,
        useFactory: adapterFactory,
      })
    ),

    // Auth
    provideAuth(),
    provideIcons(),
    provideFuse({
      ...(environment.production
        ? {}
        : {
            mockApi: {
              delay: 0,
              services: mockApiServices,
            },
          }),
      fuse: fuseUiConfig,
    }),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
};
