import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FxPortalService } from '../../services/fx-portal.service';
import { TradeResponse, PageResponse } from '../../models/fx-portal.models';

@Component({
  selector: 'app-trade-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trade-history.component.html',
  styleUrls: ['./trade-history.component.css']
})
export class TradeHistoryComponent implements OnInit {
  trades: TradeResponse[] = [];
  loading = false;
  error: string | null = null;
  Math = Math; // Make Math available in template

  // Filters
  currencyPair: string = '';
  side: string = '';
  status: string = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  currencyPairs = ['', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD'];
  sides = ['', 'BUY', 'SELL'];
  statuses = ['', 'BOOKED', 'SETTLED', 'CANCELLED'];

  constructor(private fxPortalService: FxPortalService) { }

  ngOnInit() {
    this.loadTrades();
  }

  loadTrades() {
    this.loading = true;
    this.error = null;

    this.fxPortalService.getTradeHistory(
      this.currencyPair || undefined,
      this.side || undefined,
      this.status || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response: PageResponse<TradeResponse>) => {
        this.trades = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
        // Debug log
        console.log('Loaded trades:', this.trades);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load trade history';
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.currentPage = 0;
    this.loadTrades();
  }

  clearFilters() {
    this.currencyPair = '';
    this.side = '';
    this.status = '';
    this.currentPage = 0;
    this.loadTrades();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadTrades();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadTrades();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadTrades();
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
