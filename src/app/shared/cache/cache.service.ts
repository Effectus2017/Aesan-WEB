import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache: Map<string, CacheEntry> = new Map();
    private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutos en milisegundos

    /**
     * Obtiene un valor del caché
     * @param key Clave del caché
     * @returns El valor almacenado o null si no existe o expiró
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (this.isExpired(entry)) {
            this.remove(key);
            return null;
        }

        return entry.value as T;
    }

    /**
     * Almacena un valor en el caché
     * @param key Clave del caché
     * @param value Valor a almacenar
     * @param ttl Tiempo de vida en milisegundos (opcional)
     */
    set(key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
        const entry: CacheEntry = {
            value,
            timestamp: Date.now(),
            ttl
        };
        this.cache.set(key, entry);
    }

    /**
     * Elimina una entrada del caché
     * @param key Clave del caché
     */
    remove(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Limpia todo el caché
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Verifica si una entrada del caché ha expirado
     * @param entry Entrada del caché
     * @returns true si la entrada expiró
     */
    private isExpired(entry: CacheEntry): boolean {
        return Date.now() - entry.timestamp > entry.ttl;
    }
}

interface CacheEntry {
    value: any;
    timestamp: number;
    ttl: number;
}
