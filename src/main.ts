import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';

bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));

// if (process.env['NG_ENV'] === 'development' || process.env['NODE_ENV'] === 'development') {
//   import('@stagewise/toolbar').then(({ initToolbar }) => {
//     const stagewiseConfig = { plugins: [] };
//     initToolbar(stagewiseConfig);
//   });
// }
