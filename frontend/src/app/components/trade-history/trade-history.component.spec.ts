import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TradeHistoryComponent } from './trade-history.component';
import { TradeResponse, PageResponse } from '../../models/fx-portal.models';

describe('TradeHistoryComponent', () => {
  const mockTrade: TradeResponse = {
    tradeId: 't-1',
    quoteId: 'q-1',
    currencyPair: 'EUR/USD',
    side: 'BUY',
    amount: 10000,
    rate: 1.085,
    status: 'BOOKED',
    bookedAt: '2026-02-20T08:00:05'
  };

  function buildPage(trades: TradeResponse[], total = trades.length, pages = 1): PageResponse<TradeResponse> {
    return { content: trades, totalElements: total, totalPages: pages, size: 10, number: 0 };
  }

  function createComponent(pageMock = buildPage([mockTrade])) {
    const fxPortalService = {
      getTradeHistory: vi.fn().mockReturnValue(of(pageMock))
    };

    const component = new TradeHistoryComponent(fxPortalService as any);
    return { component, fxPortalService };
  }

  describe('ngOnInit', () => {
    it('should load trades on init', () => {
      const { component } = createComponent();

      component.ngOnInit();

      expect(component.trades).toEqual([mockTrade]);
      expect(component.totalElements).toBe(1);
      expect(component.totalPages).toBe(1);
      expect(component.loading).toBe(false);
    });

    it('should set error when loading fails', () => {
      const { component, fxPortalService } = createComponent();
      fxPortalService.getTradeHistory.mockReturnValue(
        throwError(() => ({ error: { message: 'Server error' } }))
      );

      component.ngOnInit();

      expect(component.error).toBe('Server error');
      expect(component.trades).toEqual([]);
      expect(component.loading).toBe(false);
    });

    it('should use generic error message when no message returned', () => {
      const { component, fxPortalService } = createComponent();
      fxPortalService.getTradeHistory.mockReturnValue(throwError(() => ({})));

      component.ngOnInit();

      expect(component.error).toBe('Failed to load trade history');
    });
  });

  describe('applyFilters', () => {
    it('should reset to page 0 and reload trades', () => {
      const { component, fxPortalService } = createComponent();
      component.currentPage = 3;

      component.applyFilters();

      expect(component.currentPage).toBe(0);
      expect(fxPortalService.getTradeHistory).toHaveBeenCalledTimes(1);
    });

    it('should pass current filter values to service', () => {
      const { component, fxPortalService } = createComponent();
      component.currencyPair = 'EUR/USD';
      component.side = 'BUY';
      component.status = 'BOOKED';

      component.applyFilters();

      expect(fxPortalService.getTradeHistory).toHaveBeenCalledWith(
        'EUR/USD', 'BUY', 'BOOKED', 0, 10
      );
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters and reload from page 0', () => {
      const { component, fxPortalService } = createComponent();
      component.currencyPair = 'EUR/USD';
      component.side = 'BUY';
      component.status = 'BOOKED';
      component.currentPage = 2;

      component.clearFilters();

      expect(component.currencyPair).toBe('');
      expect(component.side).toBe('');
      expect(component.status).toBe('');
      expect(component.currentPage).toBe(0);
      expect(fxPortalService.getTradeHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('pagination', () => {
    it('nextPage should increment page and reload', () => {
      const { component, fxPortalService } = createComponent(buildPage([mockTrade], 3, 3));
      component.ngOnInit();
      component.currentPage = 0;
      component.totalPages = 3;

      component.nextPage();

      expect(component.currentPage).toBe(1);
      expect(fxPortalService.getTradeHistory).toHaveBeenCalledTimes(2);
    });

    it('nextPage should not go beyond last page', () => {
      const { component, fxPortalService } = createComponent();
      component.ngOnInit();
      component.currentPage = 0;
      component.totalPages = 1;

      component.nextPage();

      // Only the initial load call, not a second one
      expect(component.currentPage).toBe(0);
      expect(fxPortalService.getTradeHistory).toHaveBeenCalledTimes(1);
    });

    it('previousPage should decrement page and reload', () => {
      const { component, fxPortalService } = createComponent();
      component.ngOnInit();
      component.currentPage = 2;
      component.totalPages = 3;

      component.previousPage();

      expect(component.currentPage).toBe(1);
      expect(fxPortalService.getTradeHistory).toHaveBeenCalledTimes(2);
    });

    it('previousPage should not go below 0', () => {
      const { component, fxPortalService } = createComponent();
      component.ngOnInit();
      component.currentPage = 0;

      component.previousPage();

      expect(component.currentPage).toBe(0);
      expect(fxPortalService.getTradeHistory).toHaveBeenCalledTimes(1);
    });

    it('goToPage should navigate to specific page and reload', () => {
      const { component, fxPortalService } = createComponent();
      component.ngOnInit();

      component.goToPage(4);

      expect(component.currentPage).toBe(4);
      expect(fxPortalService.getTradeHistory).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPages', () => {
    it('should return all pages when total pages <= 5', () => {
      const { component } = createComponent();
      component.totalPages = 3;
      component.currentPage = 0;

      expect(component.getPages()).toEqual([0, 1, 2]);
    });

    it('should return 5 pages centered around current page', () => {
      const { component } = createComponent();
      component.totalPages = 10;
      component.currentPage = 5;

      const pages = component.getPages();
      expect(pages).toHaveLength(5);
      expect(pages).toContain(5);
    });

    it('should not exceed total pages at the end', () => {
      const { component } = createComponent();
      component.totalPages = 10;
      component.currentPage = 9;

      const pages = component.getPages();
      expect(Math.max(...pages)).toBe(9);
    });

    it('should start from 0 at the beginning', () => {
      const { component } = createComponent();
      component.totalPages = 10;
      component.currentPage = 0;

      const pages = component.getPages();
      expect(Math.min(...pages)).toBe(0);
    });
  });
});
