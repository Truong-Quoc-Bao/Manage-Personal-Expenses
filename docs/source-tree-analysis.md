# Source Tree Analysis

## Annotated Directory Tree

```
PersonalFinanceManagementApp/
├── frontend/                          # React SPA (TypeScript, Vite)
│   ├── public/                        #   Static assets
│   ├── src/
│   │   ├── api/                       #   API client layer (axios instances)
│   │   │   ├── axiosInstance.ts        #     Configured axios with base URL + interceptors
│   │   │   ├── auth.api.ts             #     Auth endpoints (login, register, forgot/reset password)
│   │   │   ├── user.api.ts             #     User profile API
│   │   │   ├── account.api.ts          #     Account management API
│   │   │   ├── category.api.ts         #     Category API
│   │   │   └── ...                     #     Other API modules
│   │   ├── assets/                    #   Images, icons, static resources
│   │   ├── components/                #   Reusable UI components
│   │   │   ├── layouts/               #     AuthLayout, MainLayout
│   │   │   └── ui/                    #     Radix-based design system components
│   │   ├── pages/                     #   Route-based page components
│   │   │   ├── Login.tsx              #     Authentication page
│   │   │   ├── Dashboard.tsx          #     Main dashboard (360 lines)
│   │   │   ├── Transactions.tsx       #     Transaction management (720 lines)
│   │   │   ├── Accounts.tsx           #     Account management
│   │   │   ├── Budgets.tsx            #     Budget planning
│   │   │   ├── Statistics.tsx         #     Analytics & charts
│   │   │   ├── ChatBox.tsx            #     AI assistant interface
│   │   │   └── ...                    #     Other pages
│   │   ├── store/                     #   State management
│   │   ├── types/                     #   TypeScript type definitions
│   │   ├── utils/                     #   Shared utilities
│   │   └── routes.tsx                 #   App routing configuration (entry)
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
│
├── backend/
│   ├── gateway/                       # API Gateway (Node.js/Express, port 3000)
│   │   ├── app.js                     #   Entry: proxy routes + auth middleware
│   │   ├── src/middleware/
│   │   │   └── auth.middleware.js      #   JWT authentication middleware
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── auth_service/                  # Auth Service (.NET/C#, port 3006)
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── AuthService.API/       #   Web API layer (controllers, startup)
│   │       ├── AuthService.Application/ #  Business logic, DTOs, commands
│   │       ├── AuthService.Core/       #  Domain entities, interfaces
│   │       └── AuthService.Infrastructure/ # Data access, external integrations
│   │
│   ├── user_service/                  # User Service (Node.js, port 3001, gRPC 50054)
│   │   ├── app.js                     #   Entry point
│   │   ├── src/
│   │   │   ├── routes/                #   Express route handlers
│   │   │   ├── controllers/           #   Request/response logic
│   │   │   └── services/              #   Business logic
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── account_service/               # Account Service (Node.js, port 3002, gRPC 50051)
│   │   ├── app.js
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   │   └── account.controller.js
│   │   │   └── services/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── transaction_service/           # Transaction Service (.NET/C#, port 3007)
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── TransactionService.API/
│   │       ├── TransactionService.Application/
│   │       ├── TransactionService.Core/
│   │       │   ├── DTOs/              #   CategoryDisplayDto, AccountDisplayDto, etc.
│   │       │   └── Interfaces/        #   ICategoryInternalService, IRabbitMQPublisher
│   │       └── TransactionService.Infrastructure/
│   │           └── Data/              #   TransactionDbContextFactory (EF Core)
│   │
│   ├── category_service/              # Category Service (Node.js, port 3003, gRPC 50052)
│   │   ├── app.js
│   │   ├── src/
│   │   │   ├── routes/category.routes.js
│   │   │   ├── controllers/
│   │   │   └── services/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── budget_service/                # Budget Service (Node.js, port 3008, gRPC 50053)
│   │   ├── app.js
│   │   ├── src/
│   │   │   ├── routes/budget.routes.js
│   │   │   ├── controllers/
│   │   │   └── services/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── analytics_service/             # Analytics Service (Node.js, port 3004, MongoDB)
│   │   ├── app.js
│   │   ├── src/
│   │   │   ├── routes/analytics.routes.js
│   │   │   └── services/
│   │   │       └── analytics.service.js  # (1645 lines — core analytics engine)
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── notification_service/          # Notification Service (Node.js, port 3005)
│   │   ├── app.js
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── ai_service/                    # AI Service (Node.js, port 4005)
│   │   ├── app.js                     #   (1893 lines — AI chatbot, financial insights)
│   │   ├── proxy.js                   #   Proxy for external API calls
│   │   ├── public/                    #   Static frontend for AI testing
│   │   │   ├── script.js             #   Client-side JS for AI chat UI
│   │   │   └── script-cũ.js          #   Legacy version
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── shared/                        # Shared Libraries
│       ├── rabbitmq-client/           #   Shared RabbitMQ connection manager (Node.js)
│       │   └── package.json
│       ├── dotnet-shared/             #   Shared .NET libraries
│       │   └── RabbitMQ.Client.Shared/ #  RabbitMQ client for .NET services
│       │       └── RabbitMQ.Client.Shared.csproj
│       └── protos/                    #   gRPC Protocol Buffer definitions
│           └── package.json
│
├── data/                              # Data files (seed data, migrations, etc.)
├── docs/                              # Project documentation (this folder)
├── docker-compose.yml                 # Full orchestration: 13 services + 4 infra
├── .env                               # Environment configuration (not committed)
└── .gitignore
```

## Critical Folders Summary

| Folder | Purpose | Criticality |
|--------|---------|-------------|
| `backend/gateway/` | Single entry point for all API requests | **HIGH** — all traffic flows through here |
| `backend/shared/` | Shared RabbitMQ client, protobuf definitions | **HIGH** — used by all backend services |
| `frontend/src/api/` | API client layer connecting to gateway | **HIGH** — all frontend-backend communication |
| `frontend/src/pages/` | Main user-facing views | **HIGH** — core user experience |
| `backend/analytics_service/src/services/` | Core analytics engine (1645 LOC) | **HIGH** — complex business logic |
| `backend/ai_service/` | AI chatbot engine (1893 LOC) | **HIGH** — AI feature complexity |
| `backend/transaction_service/src/TransactionService.Core/` | Domain layer for transactions | **MEDIUM** — core business domain |
| `backend/auth_service/src/AuthService.API/` | Authentication endpoints | **MEDIUM** — security-critical |

## Entry Points

| Part | Entry Point | Description |
|------|-------------|-------------|
| Frontend | `frontend/src/routes.tsx` | React Router configuration |
| Gateway | `backend/gateway/app.js` | Express server + proxy setup |
| Auth Service | `backend/auth_service/src/AuthService.API/` | ASP.NET startup |
| User Service | `backend/user_service/app.js` | Express server |
| Account Service | `backend/account_service/app.js` | Express server |
| Transaction Service | `backend/transaction_service/src/TransactionService.API/` | ASP.NET startup |
| Category Service | `backend/category_service/app.js` | Express server |
| Budget Service | `backend/budget_service/app.js` | Express server |
| Analytics Service | `backend/analytics_service/app.js` | Express server |
| Notification Service | `backend/notification_service/app.js` | Express server |
| AI Service | `backend/ai_service/app.js` | Express server |
