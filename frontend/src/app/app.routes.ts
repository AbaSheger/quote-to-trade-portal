import { Routes } from '@angular/router';
import { QuoteRequestComponent } from './components/quote-request/quote-request.component';
import { TradeBookingComponent } from './components/trade-booking/trade-booking.component';
import { TradeHistoryComponent } from './components/trade-history/trade-history.component';

export const routes: Routes = [
  { path: '', redirectTo: '/quote-request', pathMatch: 'full' },
  { path: 'quote-request', component: QuoteRequestComponent },
  { path: 'trade-booking', component: TradeBookingComponent },
  { path: 'trade-history', component: TradeHistoryComponent }
];
