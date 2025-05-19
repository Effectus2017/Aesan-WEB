import { HttpClient } from '@angular/common/http';
import {
    TRANSLOCO_LOADER,
    TRANSLOCO_CONFIG,
    translocoConfig,
    TranslocoModule
} from '@ngneat/transloco';
import { NgModule } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TranslocoHttpLoader } from './transloco.http-loader';

@NgModule({
    exports: [ TranslocoModule ],
    providers: [
        {
            provide: TRANSLOCO_CONFIG,
            useValue: translocoConfig({
                availableLangs: ['es', 'en'],
                defaultLang: 'en',
                fallbackLang: 'en',
                reRenderOnLangChange: true,
                prodMode: environment.production,
            })
        },
        { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader }
    ]
})
export class TranslocoRootModule {}
