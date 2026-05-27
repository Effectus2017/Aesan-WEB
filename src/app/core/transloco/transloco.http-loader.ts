import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import { Observable, forkJoin, of, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { deepMergeTranslations } from './deep-merge-translations';

/**
 * TranslocoHttpLoader
 * -------------------
 * Carga solo las traducciones del **núcleo** (listadas en `file-index.json`): idiomas raíz,
 * navegación, diálogos comunes y mensajes del layout. El resto se carga por portal mediante
 * {@link TranslocoBundleLoaderService}.
 *
 * Flujo:
 * 1. Lee `./assets/i18n/file-index.json` (solo ficheros eager).
 * 2. Agrupa rutas por idioma (`es`, `en`, …).
 * 3. `getTranslation(lang)` fusiona todos los JSON de ese idioma para la carga inicial.
 */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly _httpClient = inject(HttpClient);

  private _translationFilePaths: Record<string, string[]> = {};
  private readonly _filesReady$ = new ReplaySubject<void>(1);

  constructor() {
    this._httpClient
      .get<string[]>('./assets/i18n/file-index.json')
      .pipe(catchError(() => of([])))
      .subscribe((files) => {
        this._processTranslationFiles(files);
        this._filesReady$.next();
      });
  }

  private _processTranslationFiles(files: string[]): void {
    this._translationFilePaths = {};
    files.forEach((file) => {
      const lang = file.split('/').pop()?.split('.')[0];
      if (lang) {
        if (!this._translationFilePaths[lang]) {
          this._translationFilePaths[lang] = [];
        }
        this._translationFilePaths[lang].push(file);
      }
    });
  }

  /**
   * Registra manualmente un archivo de traducción para un idioma (extensión puntual).
   */
  registerTranslationFile(lang: string, filePath: string): void {
    if (!this._translationFilePaths[lang]) {
      this._translationFilePaths[lang] = [];
    }
    if (!this._translationFilePaths[lang].includes(filePath)) {
      this._translationFilePaths[lang].push(filePath);
    }
  }

  getTranslation(lang: string, _data?: { scope: string }): Observable<Translation> {
    return this._filesReady$.pipe(
      take(1),
      switchMap(() => {
        if (!this._translationFilePaths[lang] || this._translationFilePaths[lang].length === 0) {
          return this._httpClient.get<Translation>(`./assets/i18n/${lang}.json`).pipe(
            catchError(() => of({} as Translation))
          );
        }

        const translationRequests = this._translationFilePaths[lang].map((path) =>
          this._httpClient.get<Translation>(path).pipe(catchError(() => of({} as Translation)))
        );

        return forkJoin(translationRequests).pipe(
          map((translations) =>
            translations.reduce((acc, curr) => deepMergeTranslations(acc, curr), {} as Translation)
          )
        );
      })
    );
  }
}
