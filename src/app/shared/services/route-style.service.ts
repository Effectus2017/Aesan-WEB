import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import { PROGRAM_CODES } from 'app/shared/const';

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
        const backgroundClass = 'bg-[#003C49]';
        const logoPath = 'assets/images/logo/aesan.png';

        return { backgroundClass, logoPath };
    }
}
