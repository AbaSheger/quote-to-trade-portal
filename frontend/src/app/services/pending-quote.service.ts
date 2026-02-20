import { Injectable } from '@angular/core';
import { QuoteResponse } from '../models/fx-portal.models';

@Injectable({
  providedIn: 'root'
})
export class PendingQuoteService {
  private readonly storageKey = 'pendingQuote';

  save(quote: QuoteResponse): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(quote));
  }

  get(): QuoteResponse | null {
    const stored = sessionStorage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<QuoteResponse>;
      if (!this.isValidQuote(parsed)) {
        this.clear();
        return null;
      }

      return parsed as QuoteResponse;
    } catch {
      this.clear();
      return null;
    }
  }

  clear(): void {
    sessionStorage.removeItem(this.storageKey);
  }

  private isValidQuote(value: Partial<QuoteResponse>): value is QuoteResponse {
    return !!(
      value.quoteId &&
      value.currencyPair &&
      value.side &&
      value.amount !== undefined &&
      value.rate !== undefined &&
      value.expiresAt &&
      value.createdAt
    );
  }
}
