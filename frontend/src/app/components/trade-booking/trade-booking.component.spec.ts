import { of } from 'rxjs';
import { vi } from 'vitest';
import { TradeBookingComponent } from './trade-booking.component';
import { QuoteResponse } from '../../models/fx-portal.models';

describe('TradeBookingComponent', () => {
  const activeQuote: QuoteResponse = {
    quoteId: 'q-1',
    currencyPair: 'EUR/USD',
    side: 'BUY',
    amount: 10000,
    rate: 1.1,
    createdAt: '2026-02-20T08:00:00',
    expiresAt: '2999-02-20T08:00:30'
  };

  function createComponent() {
    const fxPortalService = {
      bookTrade: vi.fn().mockReturnValue(
        of({
          tradeId: 't-1',
          quoteId: 'q-1',
          currencyPair: 'EUR/USD',
          side: 'BUY',
          amount: 10000,
          rate: 1.1,
          status: 'BOOKED',
          bookedAt: '2026-02-20T08:00:05'
        })
      )
    };

    const router = {
      getCurrentNavigation: vi.fn().mockReturnValue(undefined),
      navigate: vi.fn()
    };

    const cdr = { detectChanges: vi.fn() };
    const pendingQuoteService = {
      get: vi.fn().mockReturnValue(null),
      clear: vi.fn()
    };

    const component = new TradeBookingComponent(
      fxPortalService as any,
      router as any,
      cdr as any,
      pendingQuoteService as any
    );

    return { component, fxPortalService, router, pendingQuoteService };
  }

  it('should redirect to quote request when no quote is available', () => {
    const { component, router } = createComponent();

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/quote-request']);
  });

  it('should not book trade when quote is expired', () => {
    const { component, fxPortalService, pendingQuoteService } = createComponent();

    component.quote = {
      ...activeQuote,
      expiresAt: '2000-01-01T00:00:00'
    };

    component.ngOnInit();

    expect(fxPortalService.bookTrade).not.toHaveBeenCalled();
    expect(pendingQuoteService.clear).toHaveBeenCalled();
    expect(component.error).toContain('expired');
  });
});
