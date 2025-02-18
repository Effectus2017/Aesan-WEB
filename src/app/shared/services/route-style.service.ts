import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RouteStyleService {
    constructor(private _authService: AuthService) {}

    /**
     * Actualiza los estilos de la ruta basado en el programa del usuario
     * @returns Un objeto con la clase de fondo y la ruta del logo
     */
    updateRouteStyles(): { backgroundClass: string; logoPath: string } {
        const userPrograms = this._authService.getUserPrograms();

        let backgroundClass = 'bg-[#003C49]';
        let logoPath = 'assets/images/logo/aesan.png';

        if (userPrograms) {
            switch (userPrograms) {
                case 'PDAM':
                    backgroundClass = 'bg-[#4C3152]';
                    logoPath = 'assets/images/logo/pdam-150x150.png';
                    break;
                case 'PSAV':
                    backgroundClass = 'bg-[#F26B1E]';
                    logoPath = 'assets/images/logo/psav-150x150.png';
                    break;
                case 'PACNA':
                    backgroundClass = 'bg-[#F8B100]';
                    logoPath = 'assets/images/logo/pacna-150x150.png';
                    break;
                case 'PFHF':
                    backgroundClass = 'bg-[#28AF66]';
                    logoPath = 'assets/images/logo/pfhf-150x150.png';
                    break;
                case 'PAF':
                    backgroundClass = 'bg-[#4C3152]';
                    logoPath = 'assets/images/logo/pdam-150x150.png';
                    break;
                case 'PDFE':
                    backgroundClass = 'bg-[#2A788A]';
                    logoPath = 'assets/images/logo/pdfe-150x150.png';
                    break;
            }
        }

        return { backgroundClass, logoPath };
    }
}
