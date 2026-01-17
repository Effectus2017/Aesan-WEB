import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { KeyboardShortcut, KeyboardShortcutConfig, ShortcutCategory } from '../models/KeyboardShortcut';

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutsService {
  private readonly _shortcuts = new BehaviorSubject<KeyboardShortcut[]>([]);
  private readonly _shortcutsMap = new Map<string, KeyboardShortcut>();

  /**
   * Observable de todos los shortcuts registrados
   */
  get shortcuts$(): Observable<KeyboardShortcut[]> {
    return this._shortcuts.asObservable();
  }

  /**
   * Obtiene todos los shortcuts registrados
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this._shortcutsMap.values());
  }

  /**
   * Registra un nuevo shortcut
   * @param shortcut El shortcut a registrar
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    if (this._shortcutsMap.has(shortcut.id)) {
      // Si ya existe, actualizarlo
      this._shortcutsMap.set(shortcut.id, shortcut);
    } else {
      // Si no existe, agregarlo
      this._shortcutsMap.set(shortcut.id, shortcut);
    }
    this._notify();
  }

  /**
   * Remueve un shortcut
   * @param id El ID del shortcut a remover
   */
  unregisterShortcut(id: string): void {
    if (this._shortcutsMap.has(id)) {
      this._shortcutsMap.delete(id);
      this._notify();
    }
  }

  /**
   * Obtiene shortcuts filtrados por categoría
   * @param category La categoría a filtrar
   */
  getShortcutsByCategory(category: ShortcutCategory | string): KeyboardShortcut[] {
    return this.getAllShortcuts().filter((shortcut) => shortcut.category === category);
  }

  /**
   * Busca shortcuts por texto (en label o description)
   * @param searchText Texto a buscar
   */
  searchShortcuts(searchText: string): KeyboardShortcut[] {
    const lowerSearch = searchText.toLowerCase();
    return this.getAllShortcuts().filter(
      (shortcut) =>
        shortcut.label.toLowerCase().includes(lowerSearch) ||
        shortcut.description?.toLowerCase().includes(lowerSearch) ||
        shortcut.formatted.toLowerCase().includes(lowerSearch)
    );
  }

  /**
   * Obtiene todas las categorías únicas
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.getAllShortcuts().forEach((shortcut) => {
      if (shortcut.category) {
        categories.add(shortcut.category);
      }
    });
    return Array.from(categories).sort();
  }

  /**
   * Limpia todos los shortcuts registrados
   */
  clearAll(): void {
    this._shortcutsMap.clear();
    this._notify();
  }

  /**
   * Notifica a los suscriptores sobre cambios
   */
  private _notify(): void {
    this._shortcuts.next(this.getAllShortcuts());
  }
}
