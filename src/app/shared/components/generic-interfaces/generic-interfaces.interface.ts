export interface OnGenericEditComponent {
  onSubmit(): void;
  onCancel(): void;
  onBack(): void;
  onClean(event: Event): void;
  get(form: any): void;
  getAll(index: number): void;
}

export interface OnGenericAddComponent {
  onSubmit(): void;
  onCancel(): void;
  onBack(): void;
  onClean(event: Event): void;
  get(form: any): void;
  getAll(index: number): void;
}
