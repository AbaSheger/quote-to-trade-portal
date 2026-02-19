import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FxPortalService } from '../../services/fx-portal.service';
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
  timerInterval: any;
  quoteReceivedAt: number = 0;

  currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD'];

  constructor(
    private fxPortalService: FxPortalService,
    private router: Router,
    private cdr: ChangeDetectorRef
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
        this.quoteReceivedAt = Date.now();
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

    const expiresAt = Date.parse(this.quote.expiresAt);
    const createdAt = Date.parse(this.quote.createdAt);
    const quoteLifespan = Math.floor((expiresAt - createdAt) / 1000); // seconds
    const receivedAt = this.quoteReceivedAt;

    const updateTimer = () => {
      if (!this.quote) return;
      const elapsed = Math.floor((Date.now() - receivedAt) / 1000);
      this.timeRemaining = Math.max(0, quoteLifespan - elapsed);
      // Optionally log for debug:
      // console.log('DEBUG workaround timer:', { quoteLifespan, elapsed, timeRemaining: this.timeRemaining });
      if (this.timeRemaining <= 0 && this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  bookTrade() {
    if (!this.quote || this.timeRemaining <= 0) return;

    this.router.navigate(['/trade-booking'], { 
      state: { quote: this.quote } 
    });
  }

  isExpired(): boolean {
    return this.timeRemaining <= 0;
  }
}
