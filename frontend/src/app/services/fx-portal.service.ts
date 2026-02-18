import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  QuoteRequest, 
  QuoteResponse, 
  TradeRequest, 
  TradeResponse, 
  PageResponse 
} from '../models/fx-portal.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FxPortalService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  requestQuote(request: QuoteRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(`${this.apiUrl}/quotes`, request);
  }

  bookTrade(request: TradeRequest): Observable<TradeResponse> {
    return this.http.post<TradeResponse>(`${this.apiUrl}/trades`, request);
  }

  getTradeHistory(
    currencyPair?: string,
    side?: string,
    status?: string,
    page: number = 0,
    size: number = 20
  ): Observable<PageResponse<TradeResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (currencyPair) {
      params = params.set('currencyPair', currencyPair);
    }
    if (side) {
      params = params.set('side', side);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PageResponse<TradeResponse>>(`${this.apiUrl}/trades`, { params });
  }
}
