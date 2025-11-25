import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext?: AudioContext;

  constructor() {
    // No crear el AudioContext aquí - se creará cuando sea necesario (lazy initialization)
    // Esto evita problemas con políticas del navegador que requieren interacción del usuario
  }

  /**
   * Obtiene o crea el AudioContext (lazy initialization)
   */
  private getOrCreateAudioContext(): AudioContext | null {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      return this.audioContext;
    } catch (e) {
      console.warn('AudioContext no soportado:', e);
      return null;
    }
  }

  /**
   * Reproduce un sonido de notificación usando Web Audio API
   */
  async playNotificationSound(): Promise<void> {
    try {
      // Crear el contexto solo cuando sea necesario (lazy initialization)
      const audioContext = this.getOrCreateAudioContext();

      if (!audioContext) {
        // Si no se puede crear el contexto, usar fallback
        await this.playSystemBeep();
        return;
      }

      // Si el contexto está suspendido (por políticas del navegador), intentar reanudarlo
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (error) {
          // Si falla, el usuario necesita interactuar primero
          // El sonido se reproducirá en la próxima notificación después de la interacción
          return; // Salir silenciosamente sin error
        }
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar el sonido (frecuencia, tipo de onda, duración)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frecuencia inicial
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // Frecuencia final
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silenciosamente fallar si no se puede reproducir
      // No loguear el error para evitar spam en la consola
    }
  }

  /**
   * Reproduce un beep del sistema como fallback
   */
  private async playSystemBeep(): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Intentar reanudar si está suspendido
      if (audioContext.state === 'suspended') {
        try {
          await audioContext.resume();
        } catch (error) {
          // Si falla, simplemente no reproducir sonido
          console.warn('No se pudo reproducir sonido de notificación (requiere interacción del usuario)');
          return;
        }
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silenciosamente fallar si no se puede reproducir
      console.warn('No se pudo reproducir sonido de notificación:', error);
    }
  }

  /**
   * Reproduce un archivo de audio desde assets
   * @param path Ruta del archivo de audio relativa a assets (ej: 'sounds/notification.mp3')
   */
  playAudioFile(path: string): void {
    try {
      const audio = new Audio(`assets/${path}`);
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.error('Error reproduciendo archivo de audio:', error);
      });
    } catch (error) {
      console.error('Error cargando archivo de audio:', error);
    }
  }
}

