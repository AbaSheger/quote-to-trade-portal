import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FxPortalService } from '../../services/fx-portal.service';
import { PendingQuoteService } from '../../services/pending-quote.service';
import { QuoteResponse, TradeResponse } from '../../models/fx-portal.models';

@Component({
  selector: 'app-trade-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trade-booking.component.html',
  styleUrls: ['./trade-booking.component.css']
})
export class TradeBookingComponent implements OnInit {
  quote: QuoteResponse | null = null;
  trade: TradeResponse | null = null;
  loading = false;
  error: string | null = null;
  expiredWarning: string | null = null;

  constructor(
    private fxPortalService: FxPortalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pendingQuoteService: PendingQuoteService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.quote =
      navigation?.extras.state?.['quote'] ||
      history.state?.quote ||
      this.pendingQuoteService.get();
  }

  ngOnInit() {
    if (!this.quote) {
      this.router.navigate(['/quote-request']);
      return;
    }

    if (this.isQuoteExpired(this.quote)) {
      // Don't block booking on the frontend when quote expiry is reached.
      // Show a warning but attempt to book — backend will enforce final validation.
      this.expiredWarning = 'Quote has expired, attempting to book anyway.';
    }

    this.bookTrade();
  }

  bookTrade() {
    if (!this.quote) return;

    this.loading = true;
    this.error = null;

    this.fxPortalService.bookTrade({ quoteId: this.quote.quoteId }).subscribe({
      next: (response) => {
        this.pendingQuoteService.clear();
        this.trade = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to book trade';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewTradeHistory() {
    this.router.navigate(['/trade-history']);
  }

  requestNewQuote() {
    this.router.navigate(['/quote-request']);
  }

  private isQuoteExpired(quote: QuoteResponse): boolean {
    const createdAt = Date.parse(quote.createdAt);
    const expiresAt = Date.parse(quote.expiresAt);
    const totalDuration = Math.max(0, expiresAt - createdAt);
    const elapsed = Math.max(0, Date.now() - createdAt);
    return elapsed >= totalDuration;
  }
}
