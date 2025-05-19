import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import { Observable, forkJoin, of, ReplaySubject } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

/**
 * TranslocoHttpLoader
 * -------------------
 * Este loader permite cargar múltiples archivos de traducción por idioma (por ejemplo: es.json, es.school.json, etc.)
 * y fusionarlos automáticamente para que todas las claves estén disponibles en la aplicación.
 *
 * Flujo de funcionamiento:
 * 1. Lee la lista de archivos desde './assets/i18n/file-index.json'.
 * 2. Agrupa los archivos por idioma (por ejemplo, todos los archivos que empiezan con 'es').
 * 3. Cuando se solicita una traducción, espera a que la lista de archivos esté lista y luego carga y fusiona todos los archivos del idioma solicitado.
 *
 * ¿Cómo agregar nuevos archivos de traducción?
 * - Crea el archivo de traducción (ejemplo: './assets/i18n/schools/es.json').
 * - Agrega la ruta relativa del archivo a 'file-index.json'.
 * - ¡Listo! El loader lo cargará y fusionará automáticamente.
 *
 * Notas:
 * - Si no se encuentra ningún archivo para un idioma, se carga solo el archivo principal (ej: es.json).
 * - La fusión es profunda, por lo que las claves anidadas se combinan correctamente.
 * - El sistema es escalable y soporta cualquier cantidad de archivos por idioma.
 */
@Injectable({providedIn: 'root'})
export class TranslocoHttpLoader implements TranslocoLoader
{
    private _httpClient = inject(HttpClient);

    // Lista de rutas de archivos JSON por idioma
    private _translationFilePaths: Record<string, string[]> = {};
    // Subject para indicar cuando los archivos están listos
    private _filesReady$ = new ReplaySubject<void>(1);

    constructor() {
        // Al inicializar el servicio, obtener la lista de archivos disponibles desde file-index.json
        this._httpClient.get<string[]>('./assets/i18n/file-index.json')
            .pipe(catchError(() => of([])))
            .subscribe(files => {
                console.log('[TranslocoHttpLoader] Archivos encontrados en file-index.json:', files);
                this._processTranslationFiles(files);
                console.log('[TranslocoHttpLoader] _translationFilePaths:', this._translationFilePaths);
                this._filesReady$.next(); // Indicar que los archivos están listos
            });
    }

    /**
     * Procesa los archivos de traducción y los organiza por idioma
     */
    private _processTranslationFiles(files: string[]): void {
        // Reiniciar el objeto de rutas
        this._translationFilePaths = {};
        // Agrupar archivos por idioma
        files.forEach(file => {
            // Extraer el idioma del nombre del archivo (ej: es.json -> es)
            const lang = file.split('/').pop()?.split('.')[0];
            if (lang) {
                if (!this._translationFilePaths[lang]) {
                    this._translationFilePaths[lang] = [];
                }
                this._translationFilePaths[lang].push(file);
                console.log(`[TranslocoHttpLoader] Archivo registrado para idioma '${lang}':`, file);
            }
        });
        console.log('[TranslocoHttpLoader] Estado final de _translationFilePaths:', this._translationFilePaths);
    }

    /**
     * Registra manualmente un archivo de traducción para un idioma específico
     */
    registerTranslationFile(lang: string, filePath: string): void {
        if (!this._translationFilePaths[lang]) {
            this._translationFilePaths[lang] = [];
        }

        // Agregar solo si no existe ya
        if (!this._translationFilePaths[lang].includes(filePath)) {
            this._translationFilePaths[lang].push(filePath);
        }
    }

    /**
     * Obtiene todas las traducciones para un idioma combinando todos los archivos JSON
     */
    getTranslation(lang: string): Observable<Translation>
    {
        console.log(`[TranslocoHttpLoader] getTranslation llamado para: ${lang}`);
        // Esperar a que los archivos estén listos antes de continuar
        return this._filesReady$.pipe(
            take(1),
            switchMap(() => {
                // Si no tenemos la lista de archivos o no hay archivos para este idioma,
                // cargar solo el archivo principal
                if (!this._translationFilePaths[lang] || this._translationFilePaths[lang].length === 0) {
                    console.warn(`[TranslocoHttpLoader] No se encontraron archivos para el idioma '${lang}', cargando solo el archivo principal.`);
                    return this._httpClient.get<Translation>(`./assets/i18n/${lang}.json`)
                        .pipe(
                            catchError((err) => {
                                console.error(`[TranslocoHttpLoader] Error cargando archivo principal para '${lang}':`, err);
                                return of({});
                            })
                        );
                }

                // Cargar todos los archivos para el idioma solicitado
                const translationRequests = this._translationFilePaths[lang].map(path =>
                    this._httpClient.get<Translation>(path).pipe(
                        catchError(error => {
                            console.error(`[TranslocoHttpLoader] Error cargando traducción desde ${path}:`, error);
                            return of({});
                        })
                    )
                );

                // Combinar todos los archivos en un solo objeto
                return forkJoin(translationRequests).pipe(
                    map(translations => {
                        console.log(`[TranslocoHttpLoader] Traducciones cargadas para '${lang}':`, translations);
                        return translations.reduce((acc, curr) => {
                            return this._deepMerge(acc, curr);
                        }, {});
                    })
                );
            })
        );
    }

    /**
     * Combina profundamente dos objetos de traducción
     */
    private _deepMerge(target: any, source: any): any {
        const output = { ...target };

        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this._isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this._deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }

        return output;
    }

    private _isObject(item: any): boolean {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
}
