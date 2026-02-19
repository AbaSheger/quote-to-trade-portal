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

    // Only add params if they are non-empty and non-blank
    if (currencyPair && currencyPair.trim() !== '') {
      params = params.append('currencyPair', currencyPair);
    }
    if (side && side.trim() !== '') {
      params = params.append('side', side);
    }
    if (status && status.trim() !== '') {
      params = params.append('status', status);
    }

    // Remove any params with empty string values (defensive, in case)
    params = this.removeEmptyParams(params);

    return this.http.get<PageResponse<TradeResponse>>(`${this.apiUrl}/trades`, { params });
  }

  // Utility to remove empty string params (defensive)
  private removeEmptyParams(params: HttpParams): HttpParams {
    let newParams = new HttpParams();
    params.keys().forEach(key => {
      const value = params.get(key);
      if (value !== null && value !== undefined && value.trim() !== '') {
        newParams = newParams.append(key, value);
      }
    });
    return newParams;
  }
}
