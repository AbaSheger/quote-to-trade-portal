# FX Quote & Trade Portal (Demo)

**Educational demo project — not affiliated with any bank.**

A full-stack demonstration project inspired by banking FX Sales frontend developer role requirements. This project showcases modern development practices, clean architecture, and DevOps automation.

## 🎯 Project Overview

This is a portfolio/demonstration project that implements a Foreign Exchange (FX) quote-to-trade workflow. It allows users to:

1. **Request FX Quotes**: Get real-time (simulated) exchange rates for currency pairs
2. **Book Trades**: Execute trades based on valid quotes before they expire
3. **View Trade History**: Browse historical trades with filtering and pagination

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Java 17 (Spring Boot 3.2.2)
- Spring Data JPA
- PostgreSQL 16
- Flyway (Database migrations)
- Maven 3
- JUnit 5 + Mockito + Testcontainers (Testing)
- OpenAPI/Swagger (API documentation)
- Spring Boot Actuator (Health checks)

**Frontend:**
- Angular 21 (latest)
- TypeScript
- Bootstrap 5
- RxJS

**DevOps:**
- Docker & Docker Compose
- GitHub Actions CI/CD
- Nginx (Frontend reverse proxy)

### Architecture Diagram

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Angular   │─────▶│   Nginx      │─────▶│  Spring Boot │
│  Frontend   │      │  (Reverse    │      │   Backend    │
│   (Port 80) │      │   Proxy)     │      │  (Port 8080) │
└─────────────┘      └──────────────┘      └──────┬───────┘
                                                   │
                                                   │
                                            ┌──────▼───────┐
                                            │  PostgreSQL  │
                                            │   Database   │
                                            │ (Port 5432)  │
                                            └──────────────┘
```

## 📁 Project Structure

```
quote-to-trade-portal/
├── backend/                      # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/demo/fxportal/
│   │   │   │   ├── FxPortalApplication.java
│   │   │   │   ├── config/          # Configuration classes
│   │   │   │   ├── controller/      # REST controllers
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── model/           # JPA entities
│   │   │   │   ├── repository/      # JPA repositories
│   │   │   │   └── service/         # Business logic
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/    # Flyway SQL scripts
│   │   └── test/                    # Unit and integration tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                     # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── quote-request/
│   │   │   │   ├── trade-booking/
│   │   │   │   └── trade-history/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   └── environments/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # CI/CD pipeline
├── docker-compose.yml            # Docker orchestration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- (Optional) Java 21+ (or any JDK ≥ 17) and Maven for local backend development
  - A `.sdkmanrc` file is included — if you use [SDKMAN](https://sdkman.io/), run `sdk env` to auto-select the correct JDK
- (Optional) Node.js 24+ and npm for local frontend development

### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AbaSheger/quote-to-trade-portal.git
   cd quote-to-trade-portal
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - Health endpoint: http://localhost:8080/actuator/health

### Local Development

#### Backend

```bash
cd backend

# Run with PostgreSQL in Docker
docker run -d -p 5432:5432 \
  -e POSTGRES_DB=fxportal \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine

# Build and run
./mvnw spring-boot:run

# Run tests
./mvnw test
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run linting
npm run lint
```

## 📊 Database Schema

### Tables

**quotes:**
- `id` (UUID, PK)
- `currency_pair` (VARCHAR)
- `side` (VARCHAR: BUY/SELL)
- `amount` (DECIMAL)
- `rate` (DECIMAL)
- `expires_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

**trades:**
- `id` (UUID, PK)
- `quote_id` (UUID, FK → quotes.id)
- `currency_pair` (VARCHAR)
- `side` (VARCHAR: BUY/SELL)
- `amount` (DECIMAL)
- `rate` (DECIMAL)
- `status` (VARCHAR: BOOKED/SETTLED/CANCELLED)
- `booked_at` (TIMESTAMP)

## 🔌 API Endpoints

### Quotes

**POST /api/quotes**
- Request a new FX quote
- Body: `{ "currencyPair": "EUR/USD", "side": "BUY", "amount": 10000 }`
- Response: Quote with ID, rate, and expiration time (30 seconds)

### Trades

**POST /api/trades**
- Book a trade based on a quote
- Body: `{ "quoteId": "uuid" }`
- Response: Trade confirmation with details

**GET /api/trades**
- Get trade history with filters
- Query params: `currencyPair`, `side`, `status`, `fromDate`, `toDate`, `page`, `size`
- Response: Paginated list of trades

### Actuator

**GET /actuator/health**
- Health check endpoint
- Response: Application health status

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
./mvnw test

# Integration tests with Testcontainers
./mvnw verify

# Test coverage report
./mvnw test jacoco:report
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# E2E tests (if configured)
npm run e2e
```

## 🔒 Security Features

- Input validation using Jakarta Validation
- SQL injection prevention via JPA/Hibernate
- CORS configuration for frontend-backend communication
- Health check endpoints for monitoring
- Dependency vulnerability scanning in CI/CD pipeline

## 📈 CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Backend Build & Test**
   - Maven build
   - Unit tests execution
   - Test report generation

2. **Frontend Build & Test**
   - npm install
   - Linting
   - Production build

3. **Security Scanning**
   - OWASP Dependency Check
   - Vulnerability reports

4. **Docker Images**
   - Backend image build
   - Frontend image build
   - Layer caching optimization

5. **Integration Tests**
   - Full stack testing with PostgreSQL
   - API integration validation

## 🎨 Features Demonstrated

### Backend
- ✅ RESTful API design
- ✅ Clean architecture (layered: Controller → Service → Repository)
- ✅ Database migrations with Flyway
- ✅ JPA/Hibernate ORM
- ✅ Exception handling and validation
- ✅ OpenAPI documentation
- ✅ Health monitoring
- ✅ Unit testing with Mockito
- ✅ Integration testing with Testcontainers

### Frontend
- ✅ Component-based architecture
- ✅ Reactive programming with RxJS
- ✅ Routing and navigation
- ✅ Form validation
- ✅ HTTP client service
- ✅ Responsive UI with Bootstrap
- ✅ Real-time countdown timer
- ✅ Pagination and filtering

### DevOps
- ✅ Docker containerization
- ✅ Multi-stage Docker builds
- ✅ Docker Compose orchestration
- ✅ CI/CD automation
- ✅ Automated testing
- ✅ Security scanning
- ✅ Health checks

## 🌟 Future Enhancements

Potential improvements for this demo:

- [ ] Authentication & Authorization (Spring Security + JWT)
- [ ] WebSocket for real-time quote updates
- [ ] Redis caching for quotes
- [ ] Message queue (RabbitMQ/Kafka) for trade processing
- [ ] Monitoring with Prometheus & Grafana
- [ ] ELK stack for logging
- [ ] Kubernetes deployment manifests
- [ ] End-to-end testing with Cypress
- [ ] GraphQL API alternative
- [ ] Multi-currency calculator
- [ ] Trade settlement workflow
- [ ] Audit logging

## 📝 Notes

- This is an **educational demo project** and should not be used in production
- Exchange rates are **simulated** and do not reflect real market data
- The project demonstrates technical skills and is **not affiliated with any bank or financial institution**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created as a portfolio demonstration project.

---

**Disclaimer**: This is a demonstration project created for educational and portfolio purposes. It is not intended for production use and does not represent any real financial institution or service.
