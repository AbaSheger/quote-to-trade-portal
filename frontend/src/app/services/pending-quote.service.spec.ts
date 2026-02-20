import { TestBed } from '@angular/core/testing';
import { PendingQuoteService } from './pending-quote.service';
import { QuoteResponse } from '../models/fx-portal.models';

describe('PendingQuoteService', () => {
  let service: PendingQuoteService;

  const mockQuote: QuoteResponse = {
    quoteId: 'quote-1',
    currencyPair: 'EUR/USD',
    side: 'BUY',
    amount: 10000,
    rate: 1.085,
    expiresAt: '2026-02-20T09:00:00',
    createdAt: '2026-02-20T08:59:30'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingQuoteService);
    sessionStorage.clear();
  });

  it('should save and load a quote', () => {
    service.save(mockQuote);

    const loaded = service.get();

    expect(loaded).toEqual(mockQuote);
  });

  it('should clear malformed JSON entries', () => {
    sessionStorage.setItem('pendingQuote', '{invalid-json');

    const loaded = service.get();

    expect(loaded).toBeNull();
    expect(sessionStorage.getItem('pendingQuote')).toBeNull();
  });

  it('should clear structurally invalid quote entries', () => {
    sessionStorage.setItem('pendingQuote', JSON.stringify({ quoteId: 'only-id' }));

    const loaded = service.get();

    expect(loaded).toBeNull();
    expect(sessionStorage.getItem('pendingQuote')).toBeNull();
  });
});
