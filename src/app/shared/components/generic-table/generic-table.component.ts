import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { GenericTableConfig, OnGenericTableHandler } from './generic-table.interface';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatCheckboxModule, TranslocoModule],
})
export class GenericTableComponent implements OnInit {
  @Input() config: GenericTableConfig;
  @Input() dataSource: MatTableDataSource<any>;
  @Input() columnsSchema: any[];
  @Input() displayedColumns: string[];
  @ViewChild(MatSort) sort: MatSort;
  @Input() handler: OnGenericTableHandler;

  ngOnInit(): void {
    // Valores por defecto
    this.config = {
      ...{
        showPaginator: true,
        pageSize: 10,
        pageSizeOptions: [5, 10, 25, 100],
        length: 0
      },
      ...this.config
    };
  }

  // Functions
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  onEdit(event: Event, id: number): void {
    this.handler.onEdit(event, id);
  }

  onDelete(event: Event, id: number): void {
    this.handler.onDelete(event, id);
  }

//   onCheckChange(event: Event, element: any): void {
//     this.handler.onCheckChange(event, element);
//   }

}
