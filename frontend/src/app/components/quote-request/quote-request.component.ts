import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FxPortalService } from '../../services/fx-portal.service';
import { PendingQuoteService } from '../../services/pending-quote.service';
import { QuoteRequest, QuoteResponse } from '../../models/fx-portal.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quote-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quote-request.component.html',
  styleUrls: ['./quote-request.component.css']
})
export class QuoteRequestComponent {
  request: QuoteRequest = {
    currencyPair: 'EUR/USD',
    side: 'BUY',
    amount: 10000
  };

  quote: QuoteResponse | null = null;
  loading = false;
  error: string | null = null;
  timeRemaining: number = 0;
  timerInterval: ReturnType<typeof setInterval> | null = null;

  currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD'];

  constructor(
    private fxPortalService: FxPortalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pendingQuoteService: PendingQuoteService
  ) { }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  requestQuote() {
    this.loading = true;
    this.error = null;
    this.quote = null;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.fxPortalService.requestQuote(this.request).subscribe({
      next: (response) => {
        this.quote = response;
        this.loading = false;
        this.startTimer();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to request quote';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startTimer() {
    if (!this.quote) return;

    // Use createdAt and expiresAt pair to avoid timezone parsing issues.
    const createdAtTs = Date.parse(this.quote.createdAt);
    const expiresAtTs = Date.parse(this.quote.expiresAt);
    const totalDurationMs = Math.max(0, expiresAtTs - createdAtTs);

    const updateTimer = () => {
      if (!this.quote) return;
      const now = Date.now();
      const elapsed = Math.max(0, now - createdAtTs);
      const remainingMs = Math.max(0, totalDurationMs - elapsed);
      this.timeRemaining = Math.floor(remainingMs / 1000);
      if (this.timeRemaining <= 0 && this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  bookTrade() {
    if (!this.quote) return;
    this.pendingQuoteService.save(this.quote);
    this.router.navigate(['/trade-booking'], { 
      state: { quote: this.quote } 
    });
  }

  isExpired(): boolean {
    return this.timeRemaining <= 0;
  }
}
