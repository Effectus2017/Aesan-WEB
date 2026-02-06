import { Pipe, PipeTransform } from '@angular/core';
import { formatTimeForDisplay } from './service-days-display.pipe';

/** Formato: "Desayuno 9:00-9:30 AM · Almuerzo 12:00-12:30 PM · Merienda 3:30-4:00 PM" */
@Pipe({
  name: 'extraDayServicesDisplay',
  standalone: true,
})
export class ExtraDayServicesDisplayPipe implements PipeTransform {
  transform(
    services: Array<{ serviceTypeName: string; from: string; to: string }> | null | undefined
  ): string {
    if (!services?.length) return '';
    return services
      .map((s) => `${s.serviceTypeName} ${formatTimeForDisplay(s.from)}-${formatTimeForDisplay(s.to)}`)
      .join(' · ');
  }
}
