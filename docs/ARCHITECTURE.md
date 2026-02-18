# Architecture Documentation

## System Architecture

### High-Level Architecture

The FX Quote & Trade Portal follows a modern three-tier architecture:

```
┌───────────────────────────────────────────────────────────────┐
│                        Presentation Layer                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │          Angular Frontend (SPA)                          │ │
│  │  - Components (Quote Request, Trade Booking, History)   │ │
│  │  - Services (HTTP Client)                               │ │
│  │  - Routing & State Management                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTP/REST
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                       Application Layer                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           Spring Boot Backend (REST API)                 │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Controllers (REST Endpoints)                      │ │ │
│  │  └─────────────────┬──────────────────────────────────┘ │ │
│  │  ┌─────────────────┴──────────────────────────────────┐ │ │
│  │  │  Services (Business Logic)                         │ │ │
│  │  │  - QuoteService (Generate quotes)                  │ │ │
│  │  │  - TradeService (Book trades, history)             │ │ │
│  │  └─────────────────┬──────────────────────────────────┘ │ │
│  │  ┌─────────────────┴──────────────────────────────────┐ │ │
│  │  │  Repositories (Data Access)                        │ │ │
│  │  │  - JPA/Hibernate                                   │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │ JDBC
                            │
┌───────────────────────────┴───────────────────────────────────┐
│                        Data Layer                              │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                 PostgreSQL Database                      │ │
│  │  - quotes table                                          │ │
│  │  - trades table                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (Angular)

**Technology Stack:**
- Angular 21 with TypeScript
- Bootstrap 5 for UI components
- RxJS for reactive programming
- HttpClient for API communication

**Key Components:**

1. **NavbarComponent**: Application navigation bar
2. **QuoteRequestComponent**: Form to request FX quotes
   - Currency pair selection
   - Buy/Sell side selection
   - Amount input
   - Real-time countdown timer for quote expiration
3. **TradeBookingComponent**: Trade confirmation and booking
4. **TradeHistoryComponent**: Paginated trade history with filters
   - Currency pair filter
   - Side filter (Buy/Sell)
   - Status filter
   - Pagination controls

**Services:**
- **FxPortalService**: Central API client for all backend communications

### Backend (Spring Boot)

**Technology Stack:**
- Java 17
- Spring Boot 3.2.2
- Spring Data JPA
- PostgreSQL
- Flyway for migrations
- OpenAPI/Swagger for documentation
- Spring Boot Actuator for monitoring

**Layered Architecture:**

1. **Controller Layer** (`controller` package)
   - `QuoteController`: POST /api/quotes
   - `TradeController`: POST /api/trades, GET /api/trades
   - `GlobalExceptionHandler`: Centralized exception handling

2. **Service Layer** (`service` package)
   - `QuoteService`: Business logic for quote generation
     - Simulates exchange rates with random spread
     - Sets 30-second expiration
   - `TradeService`: Business logic for trade booking and history
     - Validates quote expiration
     - Supports filtering and pagination

3. **Repository Layer** (`repository` package)
   - `QuoteRepository`: JPA repository for quotes
   - `TradeRepository`: JPA repository with Specification support

4. **Model Layer** (`model` package)
   - `Quote`: Entity for FX quotes
   - `Trade`: Entity for executed trades

5. **DTO Layer** (`dto` package)
   - Request/Response objects for API contracts

### Database Schema

**quotes table:**
```sql
CREATE TABLE quotes (
    id UUID PRIMARY KEY,
    currency_pair VARCHAR(10) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    amount DECIMAL(19, 4) NOT NULL,
    rate DECIMAL(19, 6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**trades table:**
```sql
CREATE TABLE trades (
    id UUID PRIMARY KEY,
    quote_id UUID NOT NULL,
    currency_pair VARCHAR(10) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    amount DECIMAL(19, 4) NOT NULL,
    rate DECIMAL(19, 6) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
    booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id)
);
```

## API Design

### RESTful Endpoints

**Quote API:**
- `POST /api/quotes` - Request a new quote
  - Request: `{ currencyPair, side, amount }`
  - Response: `{ quoteId, currencyPair, side, amount, rate, expiresAt, createdAt }`

**Trade API:**
- `POST /api/trades` - Book a trade
  - Request: `{ quoteId }`
  - Response: `{ tradeId, quoteId, currencyPair, side, amount, rate, status, bookedAt }`
  
- `GET /api/trades` - Get trade history
  - Query params: `currencyPair`, `side`, `status`, `fromDate`, `toDate`, `page`, `size`
  - Response: Paginated list of trades

**Health Monitoring:**
- `GET /actuator/health` - Application health status

## Data Flow

### Quote Request Flow
```
User → QuoteRequestComponent → FxPortalService → POST /api/quotes
    ← QuoteResponse with 30s expiration timer ← QuoteController
                                                     ↓
                                              QuoteService
                                                     ↓
                                              QuoteRepository
                                                     ↓
                                               Database (quotes)
```

### Trade Booking Flow
```
User → TradeBookingComponent → FxPortalService → POST /api/trades
    ← TradeResponse ← TradeController
                           ↓
                      TradeService
                      (validates quote)
                           ↓
                      TradeRepository
                           ↓
                     Database (trades)
```

## Security Considerations

1. **Input Validation**: Jakarta Validation annotations on DTOs
2. **SQL Injection Prevention**: JPA/Hibernate parameterized queries
3. **CORS**: Configured for frontend-backend communication
4. **No Authentication**: This is a demo; production would require OAuth2/JWT

## Deployment Architecture

```
                        ┌──────────────┐
                        │   Internet   │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │   Nginx:80   │
                        │  (Frontend)  │
                        └──────┬───────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
             ┌──────▼───────┐    ┌───────▼────────┐
             │ Spring Boot  │    │   PostgreSQL   │
             │  Backend     │────│   Database     │
             │  (Port 8080) │    │  (Port 5432)   │
             └──────────────┘    └────────────────┘
```

## Testing Strategy

### Backend Testing
1. **Unit Tests**: Service layer with Mockito
2. **Integration Tests**: Full stack with Testcontainers
3. **API Tests**: Controller layer tests

### Frontend Testing
1. **Unit Tests**: Component and service tests with Jasmine
2. **E2E Tests**: (Future) Cypress or Playwright

## CI/CD Pipeline

**GitHub Actions Workflow:**

1. **Build Phase**:
   - Backend: Maven build
   - Frontend: npm build

2. **Test Phase**:
   - Backend: JUnit tests
   - Frontend: npm test

3. **Security Phase**:
   - OWASP Dependency Check
   - Vulnerability scanning

4. **Docker Phase**:
   - Build Docker images
   - Push to registry (future)

5. **Deploy Phase**:
   - Docker Compose deployment (demo)
   - Kubernetes (future enhancement)

## Monitoring & Observability

**Current:**
- Spring Boot Actuator health checks
- Application logs

**Future Enhancements:**
- Prometheus metrics
- Grafana dashboards
- ELK stack for centralized logging
- Distributed tracing with Zipkin

## Performance Considerations

1. **Database Indexing**: Added indexes on frequently queried columns
2. **Connection Pooling**: HikariCP (Spring Boot default)
3. **API Pagination**: Implemented for trade history
4. **Caching**: (Future) Redis for quotes

## Scalability

**Current State:** Single instance deployment

**Future Enhancements:**
- Horizontal scaling with load balancer
- Database read replicas
- Message queue for async processing
- Microservices architecture (quote service, trade service, etc.)

## Technology Choices

### Why Spring Boot?
- Industry standard for Java backends
- Rich ecosystem and community support
- Built-in features (Actuator, security, data access)
- Easy integration with cloud platforms

### Why Angular?
- Full-featured framework for enterprise applications
- TypeScript for type safety
- Comprehensive tooling and CLI
- Strong community and corporate backing

### Why PostgreSQL?
- ACID compliance for financial data
- Excellent performance
- Rich feature set (JSON, UUID, etc.)
- Open source with enterprise support

### Why Docker?
- Consistent environments (dev, test, prod)
- Easy deployment and scaling
- Microservices support
- Industry standard containerization

## Design Patterns

1. **Repository Pattern**: Data access abstraction
2. **Service Pattern**: Business logic separation
3. **DTO Pattern**: API contract definition
4. **Builder Pattern**: Object construction (Lombok)
5. **Observer Pattern**: RxJS observables in frontend
