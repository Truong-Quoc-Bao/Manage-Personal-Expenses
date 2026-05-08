# Integration Architecture

## Overview

The Personal Finance Management App uses a multi-protocol integration strategy:

1. **REST via Gateway** — Client-to-service communication
2. **gRPC** — Synchronous inter-service calls
3. **RabbitMQ** — Asynchronous event-driven communication
4. **Redis** — Shared caching layer

## Service Dependency Graph

```
Frontend (React SPA)
    │
    │ REST (HTTP)
    ▼
┌────────────────────────────────────────────────────────┐
│                  API Gateway (:3000)                     │
│            JWT Auth → Proxy to services                  │
└──┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬──────────┘
   │     │     │     │     │     │     │     │
   ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼
 Auth  User  Acct  Trans  Cat  Budgt Analy Notif  AI
 :3006 :3001 :3002 :3007 :3003 :3008 :3004 :3005 :4005
   │     │     │     │     │     │     │     │
   │     │     │  ┌──┤     │     │     │     │
   │     │     │  │  ├─gRPC→Acct │     │     │
   │     │     │  │  ├─gRPC→Cat  │     │     │
   │     │     │  │  │     │     │     │     │
   │     │     │  │  ├─RabbitMQ──┼─────┼→Analy
   │     │     │  │  ├─RabbitMQ──┼─────┤     │
   │     │     │  │  └─RabbitMQ──┼─────┼→Notif
   │     │     │  │        │     │     │
   ├─RabbitMQ─→User│        │     │     │
   │     │     │  │        │     │     │
   └─────┴─────┴──┴────────┴─────┴─────┘
              │           │          │
         ┌────▼────┐ ┌────▼────┐ ┌───▼───┐
         │RabbitMQ │ │  Redis  │ │MongoDB│
         └─────────┘ └─────────┘ └───────┘
```

## Integration Points Detail

### 1. Frontend → Gateway (REST)

| From | To | Protocol | Details |
|------|----|----------|---------|
| React SPA | Gateway | HTTP/REST | All API calls via `axiosInstance.ts` with JWT Bearer token |

- Base URL configured dynamically in `getBaseURL()` function
- Token attached via Axios interceptors
- Routes prefixed with `/api/` matching gateway proxy rules

### 2. Gateway → Backend Services (HTTP Proxy)

| Gateway Route | Target Service | Auth | Notes |
|--------------|----------------|------|-------|
| `/api/auth` | auth_service:3006 | Partial (public routes exempt) | Login, register, password reset |
| `/api/users` | user_service:3001 | JWT | User profile management |
| `/api/accounts` | account_service:3002 | JWT | Financial accounts |
| `/api/transactions` | transaction_service:3007 | JWT | Adds `X-User-Id` header |
| `/api/categories` | category_service:3003 | JWT | Category management |
| `/api/budgets` | budget_service:3008 | JWT | Budget management |
| `/api/analytics` | analytics_service:3004 | JWT | Analytics and reports |
| `/api/notifications` | notification_service:3005 | JWT | Push notifications |
| `/api/ai` | ai_service:4005 | **None** | Path rewrite: `/api/ai` → `/` |

### 3. Inter-Service gRPC Calls

| From | To | gRPC Port | Operations |
|------|----|-----------|------------|
| transaction_service | account_service | 50051 | `ValidateAccountAsync` — validate account exists before transaction |
| transaction_service | category_service | 50052 | `ValidateCategoryAsync`, `GetCategoryDisplayAsync` — validate and display category info |
| analytics_service | budget_service | 50053 | Budget threshold checks for anomaly detection |
| notification_service | user_service | 50054 | Fetch user profile for notification delivery |

Shared protobuf definitions: `backend/shared/protos/`

### 4. RabbitMQ Event Flows

#### Flow A: Transaction → Analytics Pipeline

```
Transaction Service
    │
    ├── transaction.created ──→ Analytics Service
    │                              └── HandleTransactionCreated
    │                                   └── FlattenObject
    │                                        └── Update MongoDB collections
    │
    ├── transaction.updated ──→ Analytics Service
    │                              └── HandleTransactionUpdated
    │                                   └── FlattenObject
    │                                        └── Recalculate aggregates
    │
    └── transaction.deleted ──→ Analytics Service
                                   └── HandleTransactionDeleted
                                        └── FlattenObject
                                             └── Remove from collections
```

#### Flow B: Transaction → Budget Monitoring

```
Transaction Service
    │
    └── transaction.created/updated ──→ Budget Service
                                            └── Check budget thresholds
                                                 └── (If exceeded) → Notification Service
```

#### Flow C: User Registration

```
Auth Service
    │
    └── user.created ──→ User Service
                              └── HandleUserCreate
                                   └── Connect (create profile)
```

### 5. Redis (Shared Cache)

All services connect to the same Redis instance for:
- Session/token caching (auth_service)
- API response caching (analytics_service, dashboard_cache)
- Rate limiting (gateway)
- General-purpose caching (all services)

### 6. N8N Workflow Automation

N8N runs as a separate container with webhook support for:
- Scheduled financial reports
- Automated notifications
- External integrations (bank connections)

## Data Flow: Complete Transaction Lifecycle

```
1. User creates transaction in React UI
2. POST /api/transactions → Gateway
3. Gateway validates JWT → proxies to transaction_service
4. transaction_service validates:
   a. gRPC → account_service.ValidateAccountAsync()
   b. gRPC → category_service.ValidateCategoryAsync()
5. Transaction saved to database
6. RabbitMQ event "transaction.created" published
7. analytics_service consumes event:
   a. FlattenObject → stores in MongoDB
   b. Updates user_analytics, category_summary, spending_trends
   c. Checks for anomalies → creates anomaly_logs
8. budget_service consumes event:
   a. Checks budget thresholds
   b. If over-budget → publishes notification event
9. notification_service delivers push notification
10. Frontend dashboard refreshes with updated data
```
