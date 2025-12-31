import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 1;

  @Output() pageChange = new EventEmitter<number>();

  maxVisiblePages = 5;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageChange.emit(page);
  }

  pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];

    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    start = Math.max(1, end - this.maxVisiblePages + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
