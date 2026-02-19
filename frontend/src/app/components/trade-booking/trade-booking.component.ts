import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FxPortalService } from '../../services/fx-portal.service';
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

  constructor(
    private fxPortalService: FxPortalService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.quote = navigation.extras.state['quote'];
    }
  }

  ngOnInit() {
    if (!this.quote) {
      this.router.navigate(['/quote-request']);
      return;
    }
    this.bookTrade();
  }

  bookTrade() {
    if (!this.quote) return;

    this.loading = true;
    this.error = null;

    this.fxPortalService.bookTrade({ quoteId: this.quote.quoteId }).subscribe({
      next: (response) => {
        console.log('Trade booking response:', response);
        this.trade = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Trade booking error:', err);
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
}
