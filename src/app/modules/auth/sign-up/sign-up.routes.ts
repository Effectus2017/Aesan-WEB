import { Routes } from '@angular/router';
import { AuthSignUpComponent } from 'app/modules/auth/sign-up/sign-up.component';
import { initialSignUpResolver } from './sign-up.resolvers';

export default [
    {
        path     : '',
        component: AuthSignUpComponent,
        resolve: {
            data: initialSignUpResolver
        }
    },
] as Routes;
