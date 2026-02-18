import { Component } from '@angular/core';
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

  currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD'];

  constructor(
    private fxPortalService: FxPortalService,
    private router: Router
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
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to request quote';
        this.loading = false;
      }
    });
  }

  startTimer() {
    if (!this.quote) return;

    const updateTimer = () => {
      if (!this.quote) return;
      
      const now = new Date().getTime();
      const expiresAt = new Date(this.quote.expiresAt).getTime();
      this.timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

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
