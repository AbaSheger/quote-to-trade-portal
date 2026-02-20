import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FxPortalService } from './fx-portal.service';
import { QuoteRequest, QuoteResponse, TradeRequest, TradeResponse, PageResponse } from '../models/fx-portal.models';

describe('FxPortalService', () => {
  let service: FxPortalService;
  let httpMock: HttpTestingController;

  const mockQuote: QuoteResponse = {
    quoteId: 'q-1',
    currencyPair: 'EUR/USD',
    side: 'BUY',
    amount: 10000,
    rate: 1.085,
    expiresAt: '2999-12-31T23:59:59',
    createdAt: '2026-02-20T08:00:00'
  };

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

  const mockPage: PageResponse<TradeResponse> = {
    content: [mockTrade],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FxPortalService]
    });
    service = TestBed.inject(FxPortalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('requestQuote', () => {
    it('should POST to /api/quotes and return quote', () => {
      const request: QuoteRequest = { currencyPair: 'EUR/USD', side: 'BUY', amount: 10000 };

      service.requestQuote(request).subscribe(res => {
        expect(res).toEqual(mockQuote);
      });

      const req = httpMock.expectOne('/api/quotes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockQuote);
    });

    it('should send SELL side correctly', () => {
      const request: QuoteRequest = { currencyPair: 'GBP/USD', side: 'SELL', amount: 5000 };

      service.requestQuote(request).subscribe();

      const req = httpMock.expectOne('/api/quotes');
      expect(req.request.body.side).toBe('SELL');
      expect(req.request.body.currencyPair).toBe('GBP/USD');
      req.flush(mockQuote);
    });
  });

  describe('bookTrade', () => {
    it('should POST to /api/trades and return trade', () => {
      const request: TradeRequest = { quoteId: 'q-1' };

      service.bookTrade(request).subscribe(res => {
        expect(res).toEqual(mockTrade);
      });

      const req = httpMock.expectOne('/api/trades');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockTrade);
    });
  });

  describe('getTradeHistory', () => {
    it('should GET /api/trades with page and size params', () => {
      service.getTradeHistory(undefined, undefined, undefined, 0, 20).subscribe(res => {
        expect(res).toEqual(mockPage);
      });

      const req = httpMock.expectOne(r => r.url === '/api/trades');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('20');
      req.flush(mockPage);
    });

    it('should include currencyPair param when provided', () => {
      service.getTradeHistory('EUR/USD').subscribe();

      const req = httpMock.expectOne(r => r.url === '/api/trades');
      expect(req.request.params.get('currencyPair')).toBe('EUR/USD');
      req.flush(mockPage);
    });

    it('should include side param when provided', () => {
      service.getTradeHistory(undefined, 'BUY').subscribe();

      const req = httpMock.expectOne(r => r.url === '/api/trades');
      expect(req.request.params.get('side')).toBe('BUY');
      req.flush(mockPage);
    });

    it('should include status param when provided', () => {
      service.getTradeHistory(undefined, undefined, 'BOOKED').subscribe();

      const req = httpMock.expectOne(r => r.url === '/api/trades');
      expect(req.request.params.get('status')).toBe('BOOKED');
      req.flush(mockPage);
    });

    it('should omit empty string filter params', () => {
      service.getTradeHistory('', '', '').subscribe();

      const req = httpMock.expectOne(r => r.url === '/api/trades');
      expect(req.request.params.has('currencyPair')).toBeFalsy();
      expect(req.request.params.has('side')).toBeFalsy();
      expect(req.request.params.has('status')).toBeFalsy();
      req.flush(mockPage);
    });

    it('should use custom page and size', () => {
      service.getTradeHistory(undefined, undefined, undefined, 2, 10).subscribe();

      const req = httpMock.expectOne(r => r.url === '/api/trades');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockPage);
    });
  });
});
