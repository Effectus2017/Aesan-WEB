import { ActivatedRoute } from '@angular/router';

/**
 * Indica si debe mostrarse el panel de accesos rápidos según `data.showQuickAccess`
 * en la jerarquía de rutas (el último valor booleano definido gana).
 */
export function computeShowQuickAccess(activatedRoute: ActivatedRoute): boolean {
  let route = activatedRoute;
  while (route.firstChild) {
    route = route.firstChild;
  }

  let show = true;
  route.pathFromRoot.forEach((path) => {
    const data = path.routeConfig?.data;
    if (data && typeof data['showQuickAccess'] === 'boolean') {
      show = data['showQuickAccess'];
    }
  });
  return show;
}
