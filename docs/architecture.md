# Architecture Documentation

## 1. Architecture Pattern

**Microservices Architecture** with API Gateway pattern, event-driven communication (RabbitMQ), and synchronous inter-service calls (gRPC + REST).

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                            │
│                    React SPA (Vite, port 5173)                      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTP (REST)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API Gateway (port 3000)                         │
│              Express + http-proxy-middleware + JWT Auth              │
│  Routes: /api/auth, /api/users, /api/accounts, /api/transactions,  │
│          /api/categories, /api/budgets, /api/analytics,             │
│          /api/notifications, /api/ai                                │
└──┬────┬────┬────┬────┬────┬────┬────┬────┬──────────────────────────┘
   │    │    │    │    │    │    │    │    │
   ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐
│Auth ││User ││Acct ││Trans││Cat  ││Budgt││Analy││Notif││ AI  │
│.NET ││Node ││Node ││.NET ││Node ││Node ││Node ││Node ││Node │
│3006 ││3001 ││3002 ││3007 ││3003 ││3008 ││3004 ││3005 ││4005 │
└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└──┬──┘└─────┘
   │      │      │      │      │      │      │      │
   └──────┴──────┴──────┴──────┴──────┴──────┴──────┘
                        │           │          │
                   ┌────▼────┐ ┌────▼────┐ ┌───▼───┐
                   │RabbitMQ │ │  Redis  │ │MongoDB│
                   │  5672   │ │  6379   │ │ 27017 │
                   └─────────┘ └─────────┘ └───────┘
```

## 2. Communication Patterns

### 2.1 Synchronous — REST via Gateway

All client requests flow through the API Gateway (`backend/gateway/app.js`), which:
1. Applies JWT authentication middleware (except public auth routes)
2. Proxies requests to the appropriate backend service
3. Forwards `X-User-Id` header to downstream services (e.g., transaction_service)

### 2.2 Synchronous — gRPC (Inter-service)

Services that need real-time data from other services use gRPC:

| Service | gRPC Port | Provides |
|---------|-----------|----------|
| account_service | 50051 | Account validation, balance queries |
| category_service | 50052 | Category lookup, validation |
| budget_service | 50053 | Budget status queries |
| user_service | 50054 | User profile data |

Protocol Buffer definitions are shared via `backend/shared/protos/`.

### 2.3 Asynchronous — RabbitMQ Events

Event-driven communication for decoupled operations:

| Event | Publisher | Consumers | Purpose |
|-------|-----------|-----------|---------|
| `transaction.created` | transaction_service | analytics_service, budget_service, notification_service | Update analytics, check budgets, send alerts |
| `transaction.updated` | transaction_service | analytics_service, budget_service | Recalculate analytics |
| `transaction.deleted` | transaction_service | analytics_service, budget_service | Remove from analytics |
| `user.created` | auth_service | user_service | Create user profile on registration |

Shared RabbitMQ client libraries:
- **Node.js services**: `backend/shared/rabbitmq-client/` (local npm package)
- **.NET services**: `backend/shared/dotnet-shared/RabbitMQ.Client.Shared/`

## 3. Service Architecture Patterns

### 3.1 Node.js Services (7 services)

Standard layered architecture:
```
app.js (entry point)
└── src/
    ├── routes/        → Express route definitions
    ├── controllers/   → Request/response handling
    ├── services/      → Business logic
    ├── models/        → Data models (Mongoose/etc.)
    └── middleware/     → Custom middleware
```

### 3.2 .NET Services (2 services: auth, transaction)

Clean Architecture pattern:
```
ServiceName.API/           → Web API layer (controllers, DI configuration)
ServiceName.Application/   → Use cases, DTOs, commands/queries (CQRS-like)
ServiceName.Core/          → Domain entities, interfaces, business rules
ServiceName.Infrastructure/ → Data access (EF Core), external integrations
```

Both .NET services reference `backend/shared/dotnet-shared/RabbitMQ.Client.Shared/` for messaging.

## 4. Frontend Architecture

### 4.1 Component Structure

```
src/
├── api/            → Axios-based API client modules (one per domain)
├── components/
│   ├── layouts/    → AuthLayout (unauthenticated), MainLayout (authenticated)
│   └── ui/         → Radix UI-based design system (shadcn/ui pattern)
├── pages/          → Route-level page components
├── store/          → Client-side state management
├── types/          → Shared TypeScript interfaces
└── utils/          → Helper functions
```

### 4.2 Design System

Built on **Radix UI primitives** with **TailwindCSS 4** styling (shadcn/ui pattern):
- Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu
- Popover, Progress, Select, Tabs, Toast, Tooltip, and more
- `class-variance-authority` for component variants
- `clsx` + `tailwind-merge` for conditional class merging

### 4.3 Data Fetching

- **Axios** with configured instance (`axiosInstance.ts`) for base URL and interceptors
- Domain-specific API modules: `auth.api.ts`, `user.api.ts`, `account.api.ts`, `category.api.ts`
- No global data-fetching library detected (no React Query/SWR)

## 5. Data Architecture

### 5.1 Databases

| Database | Service | Purpose |
|----------|---------|---------|
| MongoDB 7 | analytics_service | Analytics data, anomaly logs, monthly reports, spending trends, dashboard cache |
| Redis 7 | Shared (all services) | Caching, session management |
| *(Service-specific DBs)* | auth, user, account, category, transaction, budget, notification | Per-service data stores (configured via .env) |

### 5.2 Analytics Data Collections (MongoDB)

Based on route analysis:
- `user_analytics` — per-user analytics aggregates
- `anomaly_logs` — spending anomaly detection results
- `category_summary` — per-category spending summaries
- `dashboard_cache` — pre-computed dashboard data
- `monthly_reports` — monthly financial reports
- `spending_trends` — trend analysis over time
- `transactions` — denormalized transaction copies for analytics

## 6. Security Architecture

### 6.1 Authentication Flow

1. Client sends credentials to `/api/auth/login`
2. Gateway forwards to auth_service (public route, no JWT required)
3. Auth service validates credentials, returns JWT token
4. Client stores JWT and includes it in `Authorization` header
5. Gateway's `auth.middleware.js` validates JWT on all protected routes
6. Validated `userId` is forwarded via `X-User-Id` header to downstream services

### 6.2 Route Protection

- **Public routes**: `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Protected routes**: All other `/api/*` routes require valid JWT
- **AI service**: `/api/ai/*` routes are currently not authenticated at gateway level

## 7. Deployment Architecture

All services are containerized and orchestrated via `docker-compose.yml`:

- **13 application containers**: frontend + gateway + 9 backend services + ai-service + n8n
- **4 infrastructure containers**: MongoDB, Redis, RabbitMQ, N8N
- **Network**: Shared `finance-network` (bridge driver)
- **Volumes**: Persistent data for MongoDB, Redis, RabbitMQ, N8N
- **Environment**: Centralized `.env` file for all service configuration
- **Development**: Volume mounts enable hot-reload for all services
