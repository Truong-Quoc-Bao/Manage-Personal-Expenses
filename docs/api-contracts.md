# API Contracts

## Gateway Route Map

All client requests are routed through the **API Gateway** (port 3000). The gateway applies JWT authentication middleware and proxies to the appropriate service.

### Authentication Routes (`/api/auth` → Auth Service :3006)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | User login |
| POST | `/api/auth/register` | Public | User registration |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password` | Public | Execute password reset |

### User Routes (`/api/users` → User Service :3001)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/profile` | JWT | Get current user profile |
| PUT | `/api/users/profile` | JWT | Update user profile |

### Account Routes (`/api/accounts` → Account Service :3002)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/accounts` | JWT | List all user accounts |
| GET | `/api/accounts/total-balance` | JWT | Get total balance across accounts |
| POST | `/api/accounts` | JWT | Create new account |
| PUT | `/api/accounts/:id` | JWT | Update account |
| DELETE | `/api/accounts/:id` | JWT | Delete account |

### Transaction Routes (`/api/transactions` → Transaction Service :3007)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/transactions` | JWT | List all transactions (with filters) |
| GET | `/api/transactions/:id` | JWT | Get transaction by ID |
| POST | `/api/transactions` | JWT | Create transaction |
| PUT | `/api/transactions/:id` | JWT | Update transaction |
| DELETE | `/api/transactions/:id` | JWT | Delete transaction |

**Note:** Gateway forwards `X-User-Id` header to transaction service.

### Category Routes (`/api/categories` → Category Service :3003)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/categories/categories` | JWT | List all categories |
| POST | `/api/categories/category` | JWT | Create category |
| PUT | `/api/categories/category/:id` | JWT | Update category |
| DELETE | `/api/categories/category/:id` | JWT | Delete category |

### Budget Routes (`/api/budgets` → Budget Service :3008)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/budgets` | JWT | List all budgets |
| GET | `/api/budgets/:id` | JWT | Get budget by ID |
| POST | `/api/budgets` | JWT | Create budget |
| PUT | `/api/budgets/:id` | JWT | Update budget |
| DELETE | `/api/budgets/:id` | JWT | Delete budget |

### Analytics Routes (`/api/analytics` → Analytics Service :3004)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analytics/user_analytics/:userId` | JWT | Get user analytics summary |
| GET | `/api/analytics/user_analytics` | JWT | Get analytics for current user |
| GET | `/api/analytics/anomaly_logs/:userId` | JWT | Get anomaly detection logs |
| GET | `/api/analytics/anomaly_logs/:userId/unread` | JWT | Get unread anomaly logs |
| GET | `/api/analytics/anomaly_logs/:userId/unread/count` | JWT | Count unread anomaly logs |
| GET | `/api/analytics/anomaly_logs/detail/:logId` | JWT | Get anomaly log detail |
| GET | `/api/analytics/category_summary/:userId` | JWT | Get category spending summary |
| GET | `/api/analytics/category_summary/:userId/by_month` | JWT | Category summary by month |
| GET | `/api/analytics/category_summary/:userId/over_budget` | JWT | Over-budget categories |
| GET | `/api/analytics/category_summary/detail/:id` | JWT | Category summary detail |
| POST | `/api/analytics/category_summary/:userId/upsert` | JWT | Upsert category summary |
| GET | `/api/analytics/dashboard_cache/:userId` | JWT | Get cached dashboard data |
| GET | `/api/analytics/dashboard_cache/account/:accountId` | JWT | Dashboard data by account |
| GET | `/api/analytics/monthly_reports/:userId` | JWT | Get monthly reports |
| GET | `/api/analytics/monthly_reports/:userId/by_month` | JWT | Report for specific month |
| GET | `/api/analytics/monthly_reports/:userId/recent` | JWT | Recent monthly reports |
| GET | `/api/analytics/monthly_reports/detail/:id` | JWT | Report detail |
| POST | `/api/analytics/monthly_reports/:userId/upsert` | JWT | Upsert monthly report |
| GET | `/api/analytics/spending_trends/:userId` | JWT | Get spending trends |
| GET | `/api/analytics/spending_trends/:userId/category/:categoryId` | JWT | Trends by category |
| GET | `/api/analytics/spending_trends/detail/:id` | JWT | Trend detail |
| GET | `/api/analytics/transactions/:userId` | JWT | Analytics transaction list |
| GET | `/api/analytics/transactions/:userId/date_range` | JWT | Transactions by date range |
| GET | `/api/analytics/transactions/:userId/category/:categoryId` | JWT | Transactions by category |
| GET | `/api/analytics/transactions/detail/:transId` | JWT | Transaction analytics detail |

### Notification Routes (`/api/notifications` → Notification Service :3005)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | JWT | List all notifications |
| PUT | `/api/notifications/read/:id` | JWT | Mark notification as read |
| PUT | `/api/notifications/read-all` | JWT | Mark all as read |
| DELETE | `/api/notifications/delete/:id` | JWT | Delete notification |
| DELETE | `/api/notifications/delete-all` | JWT | Delete all notifications |

### AI Routes (`/api/ai` → AI Service :4005)

**Note:** AI routes are proxied with path rewrite (`/api/ai` → `/`), and are currently **not authenticated** at the gateway level.

| Method | Path (Gateway) | Path (AI Service) | Description |
|--------|---------------|-------------------|-------------|
| POST | `/api/ai/chat` | `/chat` | Send chat message |
| GET | `/api/ai/chat-stream` | `/chat-stream` | Stream chat response |
| GET | `/api/ai/chat-history` | `/chat-history` | Get chat history |
| GET | `/api/ai/api/stats` | `/api/stats` | Get AI usage stats |
| GET | `/api/ai/api/budgets` | `/api/budgets` | Budget data for AI context |
| GET | `/api/ai/api/recent-transactions` | `/api/recent-transactions` | Recent transactions for AI |
| POST | `/api/ai/api/ai-deep-scan` | `/api/ai-deep-scan` | Deep financial analysis |
| GET | `/api/ai/api/ai-health` | `/api/ai-health` | AI service health check |
| GET | `/api/ai/vapid-public-key` | `/vapid-public-key` | Get VAPID key for push |
| POST | `/api/ai/subscribe` | `/subscribe` | Subscribe to push notifications |
| POST | `/api/ai/api/create-bank` | `/api/create-bank` | Create bank connection |
| POST | `/api/ai/webhook/bank-transfer` | `/webhook/bank-transfer` | Bank transfer webhook |

## gRPC Service Contracts

Inter-service gRPC communication (Protobuf definitions in `backend/shared/protos/`):

| Service | gRPC Port | Consumers | Purpose |
|---------|-----------|-----------|---------|
| account_service | 50051 | transaction_service | Account validation (`ValidateAccountAsync`) |
| category_service | 50052 | transaction_service | Category validation (`ValidateCategoryAsync`), display (`GetCategoryDisplayAsync`) |
| budget_service | 50053 | analytics_service | Budget threshold queries |
| user_service | 50054 | notification_service | User profile for notifications |

## RabbitMQ Event Contracts

| Event/Queue | Publisher | Consumer(s) | Payload |
|-------------|-----------|-------------|---------|
| Transaction Created | transaction_service | analytics_service, budget_service | Transaction object (flattened) |
| Transaction Updated | transaction_service | analytics_service, budget_service | Updated transaction object |
| Transaction Deleted | transaction_service | analytics_service, budget_service | Transaction ID + metadata |
| User Created | auth_service | user_service | User registration data |

## Total API Surface

- **Gateway REST endpoints**: ~70 routes
- **gRPC services**: 4 services with internal contracts
- **RabbitMQ events**: 4+ event types
