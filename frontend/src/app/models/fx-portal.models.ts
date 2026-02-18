export interface QuoteRequest {
  currencyPair: string;
  side: 'BUY' | 'SELL';
  amount: number;
}

export interface QuoteResponse {
  quoteId: string;
  currencyPair: string;
  side: 'BUY' | 'SELL';
  amount: number;
  rate: number;
  expiresAt: string;
  createdAt: string;
}

export interface TradeRequest {
  quoteId: string;
}

export interface TradeResponse {
  tradeId: string;
  quoteId: string;
  currencyPair: string;
  side: 'BUY' | 'SELL';
  amount: number;
  rate: number;
  status: 'BOOKED' | 'SETTLED' | 'CANCELLED';
  bookedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
