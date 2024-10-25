export interface GenericTableHandler {
  onEdit(event: Event, id: number): void;
  onDelete(event: Event, id: number): void;
  onCheckChange(event: Event, element: any): void;
}
