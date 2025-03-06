import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { TranslocoPipe } from "@ngneat/transloco";

@Component({
  selector: 'app-notification-dialog',
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">{{ data.title }}</h2>
      <p class="mb-4">{{ data.message }}</p>
      <p class="text-sm text-gray-600 mb-6">{{ data.info }}</p>
      <div class="flex justify-end">
        <button
          class="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-600"
          (click)="dialogRef.close()">
          {{ 'programs.list.notification.close' | transloco }}
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [TranslocoPipe]
})
export class NotificationDialogComponent {
  constructor(
    public dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any
  ) {}
}
