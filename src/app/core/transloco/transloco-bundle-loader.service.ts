import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Translation, TranslocoService } from '@ngneat/transloco';
import { Observable, forkJoin, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, skip, switchMap } from 'rxjs/operators';
import { deepMergeTranslations } from './deep-merge-translations';
import { TRANSLOCO_BUNDLES, TranslocoBundleId } from './transloco-bundle.config';

/**
 * Carga perezosa de archivos i18n por portal: fusiona JSON en el idioma activo sin prefijo de scope
 * (misma forma que el loader principal) y evita repetir peticiones por archivo ya cargado.
 */
@Injectable({ providedIn: 'root' })
export class TranslocoBundleLoaderService implements OnDestroy {
  private readonly _http = inject(HttpClient);
  private readonly _transloco = inject(TranslocoService);

  private readonly _loadedPaths = new Set<string>();
  private readonly _activatedBundles = new Set<TranslocoBundleId>();
  private readonly _langSub: Subscription;

  constructor() {
    this._langSub = this._transloco.langChanges$
      .pipe(
        distinctUntilChanged(),
        skip(1),
        switchMap((lang) =>
          this._transloco.load(lang).pipe(
            switchMap(() => this._reloadAllActivatedBundles(lang))
          )
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._langSub.unsubscribe();
  }

  /**
   * Garantiza que los JSON del bundle indicado estén fusionados en el idioma activo.
   */
  ensureBundle(bundleId: TranslocoBundleId): Observable<void> {
    this._activatedBundles.add(bundleId);
    const lang = this._transloco.getActiveLang();
    return this._mergeBundleForLang(bundleId, lang);
  }

  private _reloadAllActivatedBundles(lang: string): Observable<void> {
    const ids = [...this._activatedBundles];
    if (!ids.length) {
      return of(void 0);
    }
    return forkJoin(ids.map((id) => this._mergeBundleForLang(id, lang))).pipe(map(() => void 0));
  }

  private _mergeBundleForLang(bundleId: TranslocoBundleId, lang: string): Observable<void> {
    const folders = TRANSLOCO_BUNDLES[bundleId];
    if (!folders?.length) {
      return of(void 0);
    }

    const paths = folders.map((f) => `./assets/i18n/${f}/${lang}.json`);
    const toFetch = paths.filter((p) => !this._loadedPaths.has(p));
    if (!toFetch.length) {
      return of(void 0);
    }

    const requests = toFetch.map((path) =>
      this._http.get<Translation>(path).pipe(catchError(() => of({} as Translation)))
    );

    return forkJoin(requests).pipe(
      map((chunks) => {
        const merged = chunks.reduce(
          (acc, curr) => deepMergeTranslations(acc, curr),
          {} as Translation
        );
        toFetch.forEach((p) => this._loadedPaths.add(p));
        this._transloco.setTranslation(merged, lang, { merge: true, emitChange: true });
      }),
      map(() => void 0)
    );
  }
}
