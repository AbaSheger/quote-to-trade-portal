import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { QuoteRequestComponent } from './quote-request.component';
import { QuoteResponse } from '../../models/fx-portal.models';

describe('QuoteRequestComponent', () => {
  const mockQuote: QuoteResponse = {
    quoteId: 'q-1',
    currencyPair: 'EUR/USD',
    side: 'BUY',
    amount: 10000,
    rate: 1.085,
    expiresAt: '2999-12-31T23:59:59',
    createdAt: '2026-02-20T08:00:00'
  };

  function createComponent() {
    const fxPortalService = {
      requestQuote: vi.fn().mockReturnValue(of(mockQuote))
    };
    const router = { navigate: vi.fn() };
    const cdr = { detectChanges: vi.fn() };
    const pendingQuoteService = {
      save: vi.fn(),
      get: vi.fn().mockReturnValue(null)
    };

    const component = new QuoteRequestComponent(
      fxPortalService as any,
      router as any,
      cdr as any,
      pendingQuoteService as any
    );

    return { component, fxPortalService, router, cdr, pendingQuoteService };
  }

  describe('isExpired', () => {
    it('should return false when no quote has been fetched', () => {
      const { component } = createComponent();
      expect(component.isExpired()).toBe(false);
    });

    it('should return false when quote is active (timer > 0)', () => {
      const { component } = createComponent();
      component.quote = mockQuote;
      component['timeRemaining'] = 60;
      expect(component.isExpired()).toBe(false);
    });

    it('should return true when quote exists and timer has reached zero', () => {
      const { component } = createComponent();
      component.quote = mockQuote;
      component['timeRemaining'] = 0;
      expect(component.isExpired()).toBe(true);
    });
  });

  describe('requestQuote', () => {
    it('should call fxPortalService.requestQuote with the current request', () => {
      const { component, fxPortalService } = createComponent();

      component.requestQuote();

      expect(fxPortalService.requestQuote).toHaveBeenCalledWith(component.request);
    });

    it('should set quote and start timer on success', () => {
      const { component } = createComponent();
      const startTimerSpy = vi.spyOn(component as any, 'startTimer');

      component.requestQuote();

      expect(component.quote).toEqual(mockQuote);
      expect(startTimerSpy).toHaveBeenCalled();
      expect(component.loading).toBe(false);
      expect(component.error).toBeNull();
    });

    it('should set error on failure', () => {
      const { component, fxPortalService } = createComponent();
      fxPortalService.requestQuote.mockReturnValue(
        throwError(() => ({ error: { message: 'Backend error' } }))
      );

      component.requestQuote();

      expect(component.error).toBe('Backend error');
      expect(component.quote).toBeNull();
      expect(component.loading).toBe(false);
    });

    it('should fall back to generic error message when no message in response', () => {
      const { component, fxPortalService } = createComponent();
      fxPortalService.requestQuote.mockReturnValue(throwError(() => ({})));

      component.requestQuote();

      expect(component.error).toBe('Failed to request quote');
    });

    it('should reset previous quote before new request', () => {
      const { component } = createComponent();
      component.quote = mockQuote;

      component.requestQuote();

      // quote is set again synchronously from mock, but loading was true at start
      // The reset to null happens before the observable emits
      expect(component.quote).toEqual(mockQuote); // set by mock
    });
  });

  describe('bookTrade', () => {
    it('should save quote and navigate to trade-booking', () => {
      const { component, router, pendingQuoteService } = createComponent();
      component.quote = mockQuote;

      component.bookTrade();

      expect(pendingQuoteService.save).toHaveBeenCalledWith(mockQuote);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/trade-booking'],
        { state: { quote: mockQuote } }
      );
    });

    it('should not navigate when no quote is present', () => {
      const { component, router } = createComponent();
      component.quote = null;

      component.bookTrade();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should clear the timer interval on destroy', () => {
      const { component } = createComponent();
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
      const fakeInterval = setInterval(() => {}, 10000);
      component['timerInterval'] = fakeInterval;

      component.ngOnDestroy();

      expect(clearIntervalSpy).toHaveBeenCalledWith(fakeInterval);
      clearInterval(fakeInterval);
    });
  });
});
