import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Provider } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';

export const provideAuth = (): Array<Provider | EnvironmentProviders> =>
{
    return [
        // HTTP Client ahora se configura en http.config.ts
        {
            provide : ENVIRONMENT_INITIALIZER,
            useValue: () => inject(AuthService),
            multi   : true,
        },
    ];
};
