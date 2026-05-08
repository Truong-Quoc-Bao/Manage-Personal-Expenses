# Development Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ | Node.js backend services + frontend |
| **.NET SDK** | 8.0+ | Auth service + Transaction service |
| **Docker** | Latest | Container orchestration |
| **Docker Compose** | v2+ | Multi-service orchestration |
| **Git** | Latest | Version control |

## Quick Start (Docker Compose)

### 1. Clone and Configure

```bash
git clone <repository-url>
cd PersonalFinanceManagementApp

# Copy environment template
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start All Services

```bash
# Build and start everything
docker-compose up --build

# Or in detached mode
docker-compose up -d --build
```

### 3. Verify Services

| Service | URL | Health Check |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Open in browser |
| Gateway | http://localhost:3000/api/health | `{"status": "ok"}` |
| RabbitMQ UI | http://localhost:15672 | admin/admin |
| N8N | http://localhost:5678 | N8N dashboard |

## Environment Variables

The centralized `.env` file contains all service configuration:

```env
# Ports
GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
ACCOUNT_SERVICE_PORT=3002
CATEGORY_SERVICE_PORT=3003
ANALYTICS_SERVICE_PORT=3004
NOTIFICATION_SERVICE_PORT=3005
AUTH_SERVICE_PORT=3006
TRANSACTION_SERVICE_PORT=3007
BUDGET_SERVICE_PORT=3008
AI_PORT=4005
FRONTEND_PORT=5173
N8N_PORT=5678

# gRPC Ports
GRPC_ACCOUNT_SERVICE_PORT=50051
GRPC_CATEGORY_SERVICE_PORT=50052
GRPC_BUDGET_SERVICE_PORT=50053
GRPC_USER_SERVICE_PORT=50054

# Infrastructure
MONGODB_PORT=27017
REDIS_PORT=6379
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672

# Service URLs (internal Docker network)
ACCOUNT_SERVICE_URL=http://account-service:3002
USER_SERVICE_URL=http://user-service:3001
CATEGORY_SERVICE_URL=http://category-service:3003
BUDGET_SERVICE_URL=http://budget-service:3008
ANALYTICS_SERVICE_URL=http://analytics-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005
AUTH_SERVICE_URL=http://auth-service:3006
TRANSACTION_SERVICE_URL=http://transaction-service:3007
AI_SERVICE_URL=http://ai-service:4005

# Database, JWT, API Keys, etc.
# (service-specific configuration)
```

## Local Development (Without Docker)

### Frontend

```bash
cd frontend
npm install
npm run dev          # Start dev server on :5173
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Node.js Backend Services

Each Node.js service follows the same pattern:

```bash
cd backend/<service_name>
npm install
npm run dev          # Start with nodemon (hot-reload)
npm start            # Start without hot-reload
```

Services: `gateway`, `user_service`, `account_service`, `category_service`, `budget_service`, `analytics_service`, `notification_service`, `ai_service`

### .NET Backend Services

```bash
cd backend/auth_service/src/AuthService.API
dotnet restore
dotnet run           # Start in development mode

# Or for transaction_service:
cd backend/transaction_service/src/TransactionService.API
dotnet restore
dotnet run
```

### Shared Libraries

Before running services locally, install shared dependencies:

```bash
# Node.js shared RabbitMQ client
cd backend/shared/rabbitmq-client
npm install

# .NET shared library
cd backend/shared/dotnet-shared/RabbitMQ.Client.Shared
dotnet restore
```

## Infrastructure Services

Start infrastructure services separately if developing locally:

```bash
# Start only infrastructure
docker-compose up -d mongodb redis rabbitmq n8n
```

| Service | Local URL | Credentials |
|---------|-----------|-------------|
| MongoDB | mongodb://localhost:27017 | admin/admin |
| Redis | redis://localhost:6379 | — |
| RabbitMQ | amqp://localhost:5672 | admin/admin |
| RabbitMQ UI | http://localhost:15672 | admin/admin |
| N8N | http://localhost:5678 | — |

## Project Structure Conventions

### Node.js Services

```
backend/<service>/
├── app.js              # Entry point: Express setup, middleware, routes
├── src/
│   ├── routes/         # Route definitions (*.routes.js)
│   ├── controllers/    # Request handling (*.controller.js)
│   ├── services/       # Business logic (*.service.js)
│   ├── models/         # Data models
│   └── middleware/      # Custom middleware
├── Dockerfile
└── package.json
```

### .NET Services

```
backend/<service>/
├── Dockerfile
└── src/
    ├── ServiceName.API/           # Controllers, DI, startup
    ├── ServiceName.Application/   # Use cases, DTOs, CQRS
    ├── ServiceName.Core/          # Domain entities, interfaces
    └── ServiceName.Infrastructure/ # EF Core, external integrations
```

### Frontend

```
frontend/src/
├── api/            # One file per domain (auth.api.ts, user.api.ts, etc.)
├── components/
│   ├── layouts/    # AuthLayout, MainLayout
│   └── ui/         # Radix/shadcn components
├── pages/          # One file per route
├── store/          # State management
├── types/          # TypeScript interfaces
└── utils/          # Helper functions
```

## Testing

Currently, no automated test suites are detected. Services include test script placeholders:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

**Recommended testing strategy:**
- **Unit tests**: Jest/Vitest for business logic
- **Integration tests**: Supertest for API endpoints
- **E2E tests**: Playwright/Cypress for frontend flows

## Common Development Tasks

### Adding a New Backend Service

1. Create `backend/<new_service>/` directory
2. Initialize with `npm init` or `dotnet new webapi`
3. Add RabbitMQ shared client dependency
4. Add service to `docker-compose.yml`
5. Add proxy route in `backend/gateway/app.js`
6. Add Dockerfile

### Adding a New Frontend Page

1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/routes.tsx`
3. Add API client module in `frontend/src/api/` if new backend endpoints
4. Add navigation entry in layout components

### Adding a New API Endpoint

1. Add route in service's `routes/*.routes.js`
2. Add controller method in `controllers/*.controller.js`
3. Add business logic in `services/*.service.js`
4. If new gateway route needed, add proxy in `gateway/app.js`
