# File Tree: Personal Finance Management

**Generated:** 3/29/2026, 4:14:18 PM

```
├── 📁 backend
│   ├── 📁 account_service
│   │   ├── 📁 prisma
│   │   │   └── 📄 schema.prisma
│   │   ├── 📁 src
│   │   │   ├── 📁 config
│   │   │   │   ├── 📄 database.js
│   │   │   │   ├── 📄 index.js
│   │   │   │   └── 📄 rabbitmq.js
│   │   │   ├── 📁 controllers
│   │   │   │   └── 📄 account.controller.js
│   │   │   ├── 📁 dtos
│   │   │   │   └── 📄 account.dto.js
│   │   │   ├── 📁 events
│   │   │   │   ├── 📁 consumers
│   │   │   │   │   ├── 📄 transaction-created.consumer.js
│   │   │   │   │   ├── 📄 transaction-deleted.consumer.js
│   │   │   │   │   └── 📄 transaction-updated.consumer.js
│   │   │   │   ├── 📁 publishers
│   │   │   │   │   └── 📄 balance-update.publisher.js
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 generated
│   │   │   │   └── 📁 prisma
│   │   │   │       ├── 📁 internal
│   │   │   │       │   ├── 📄 class.ts
│   │   │   │       │   ├── 📄 prismaNamespace.ts
│   │   │   │       │   └── 📄 prismaNamespaceBrowser.ts
│   │   │   │       ├── 📁 models
│   │   │   │       │   └── 📄 Account.ts
│   │   │   │       ├── 📄 browser.ts
│   │   │   │       ├── 📄 client.ts
│   │   │   │       ├── 📄 commonInputTypes.ts
│   │   │   │       ├── 📄 enums.ts
│   │   │   │       ├── 📄 models.ts
│   │   │   │       └── 📄 query_engine-windows.dll.node
│   │   │   ├── 📁 grpc
│   │   │   │   └── 📄 account.grpc.js
│   │   │   ├── 📁 middlewares
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   ├── 📄 error.middleware.js
│   │   │   │   ├── 📄 index.js
│   │   │   │   └── 📄 validation.middleware.js
│   │   │   ├── 📁 repositories
│   │   │   │   └── 📄 account.repository.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 account.routes.js
│   │   │   ├── 📁 services
│   │   │   │   ├── 📄 account.service.js
│   │   │   │   └── 📄 balance.service.js
│   │   │   ├── 📁 types
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 utils
│   │   │   │   └── 📄 index.js
│   │   │   └── 📁 validator
│   │   │       ├── 📄 account.validator.js
│   │   │       └── 📄 index.js
│   │   ├── 📁 tests
│   │   ├── ⚙️ .gitignore
│   │   ├── 🐳 Dockerfile
│   │   ├── 📄 app.js
│   │   ├── ⚙️ package-lock.json
│   │   ├── ⚙️ package.json
│   │   └── 📄 prisma.config.ts
│   ├── 📁 analytics_service
│   │   ├── 📁 database
│   │   │   ├── 📄 init.mongo.js
│   │   │   ├── 📄 seed.js
│   │   │   ├── 📄 seed_anomaly_logs.js
│   │   │   ├── 📄 seed_category_summary.js
│   │   │   ├── 📄 seed_dashboard_cache.js
│   │   │   ├── 📄 seed_monthly_reports.js
│   │   │   ├── 📄 seed_spending_trends.js
│   │   │   └── 📄 seed_user_analytics.js
│   │   ├── 📁 src
│   │   │   ├── 📁 config
│   │   │   │   ├── 📄 database.js
│   │   │   │   ├── 📄 index.js
│   │   │   │   └── 📄 rabbitmq.js
│   │   │   ├── 📁 controllers
│   │   │   │   └── 📄 analytics.controller.js
│   │   │   ├── 📁 dtos
│   │   │   │   └── 📄 analytics.dto.js
│   │   │   ├── 📁 events
│   │   │   │   ├── 📁 consumers
│   │   │   │   │   └── 📄 transaction-events.consumer.js
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 middlewares
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   ├── 📄 error.middleware.js
│   │   │   │   └── 📄 validation.middleware.js
│   │   │   ├── 📁 model
│   │   │   │   ├── 📄 anomalyLog.model.js
│   │   │   │   ├── 📄 categorySummary.model.js
│   │   │   │   ├── 📄 dashboardCache.model.js
│   │   │   │   ├── 📄 index.js
│   │   │   │   ├── 📄 monthlyReport.model.js
│   │   │   │   ├── 📄 spendingTrend.model.js
│   │   │   │   └── 📄 userAnalytics.model.js
│   │   │   ├── 📁 repositories
│   │   │   │   └── 📄 analytics.repository.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 analytics.routes.js
│   │   │   ├── 📁 services
│   │   │   │   └── 📄 analytics.service.js
│   │   │   ├── 📁 types
│   │   │   │   ├── 📄 analytics.types.js
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 utils
│   │   │   │   └── 📄 index.js
│   │   │   └── 📁 validators
│   │   │       └── 📄 analytics.validator.js
│   │   ├── 📁 tests
│   │   ├── 🐳 Dockerfile
│   │   ├── 📄 app.js
│   │   ├── ⚙️ package-lock.json
│   │   └── ⚙️ package.json
│   ├── 📁 auth_service
│   │   ├── 📁 src
│   │   │   ├── 📁 AuthService.API
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   └── 📄 AuthController.cs
│   │   │   │   ├── 📁 Middlewares
│   │   │   │   │   └── 📄 ErrorHandlingMiddleware.cs
│   │   │   │   ├── 📁 Properties
│   │   │   │   │   └── ⚙️ launchSettings.json
│   │   │   │   ├── 📁 Workers
│   │   │   │   │   └── 📄 AuthBackgroundWorker.cs
│   │   │   │   ├── 📄 AuthService.API.csproj
│   │   │   │   ├── 📄 AuthService.API.http
│   │   │   │   └── 📄 Program.cs
│   │   │   ├── 📁 AuthService.Application
│   │   │   │   ├── 📁 Mappings
│   │   │   │   │   └── 📄 AutoMapper.cs
│   │   │   │   ├── 📁 Services
│   │   │   │   │   ├── 📄 AuthLogic.cs
│   │   │   │   │   └── 📄 TokenService.cs
│   │   │   │   ├── 📁 Validators
│   │   │   │   │   └── 📄 index.cs
│   │   │   │   ├── 📄 AuthService.Application.csproj
│   │   │   │   └── 📄 Class1.cs
│   │   │   ├── 📁 AuthService.Core
│   │   │   │   ├── 📁 DTOs
│   │   │   │   │   ├── 📄 LoginRequestDto.cs
│   │   │   │   │   ├── 📄 LoginResponseDto.cs
│   │   │   │   │   ├── 📄 RegisterRequestDto.cs
│   │   │   │   │   ├── 📄 UserRegistrationConsumeEvent.cs
│   │   │   │   │   └── 📄 UserRegistrationPublishEvent.cs
│   │   │   │   ├── 📁 Entities
│   │   │   │   │   ├── 📄 ApplicationUser.cs
│   │   │   │   │   └── 📄 AuthSession.cs
│   │   │   │   ├── 📁 Interfaces
│   │   │   │   │   ├── 📄 IAuthRepository.cs
│   │   │   │   │   ├── 📄 IAuthService.cs
│   │   │   │   │   ├── 📄 IRabbitMQPublisher.cs
│   │   │   │   │   └── 📄 ITokenService.cs
│   │   │   │   ├── 📄 AuthService.Core.csproj
│   │   │   │   └── 📄 Class1.cs
│   │   │   └── 📁 AuthService.Infrastructure
│   │   │       ├── 📁 Data
│   │   │       │   ├── 📄 AuthDbContext.cs
│   │   │       │   └── 📄 AuthDbContextFactory.cs
│   │   │       ├── 📁 Extensions
│   │   │       │   └── 📄 ServiceCollectionExtensions.cs
│   │   │       ├── 📁 MessageBroker
│   │   │       │   └── 📄 RabbitMQPublisher.cs
│   │   │       ├── 📁 Repositories
│   │   │       │   └── 📄 AuthRepository.cs
│   │   │       ├── 📄 AuthService.Infrastructure.csproj
│   │   │       └── 📄 Class1.cs
│   │   └── 🐳 Dockerfile
│   ├── 📁 budget_service
│   │   ├── 📁 prisma
│   │   │   └── 📄 schema.prisma
│   │   ├── ⚙️ .gitignore
│   │   ├── 🐳 Dockerfile
│   │   ├── 📄 app.js
│   │   ├── ⚙️ package-lock.json
│   │   ├── ⚙️ package.json
│   │   └── 📄 prisma.config.ts
│   ├── 📁 category_service
│   │   ├── 📁 prisma
│   │   │   └── 📄 schema.prisma
│   │   ├── 📁 src
│   │   │   ├── 📁 config
│   │   │   │   ├── 📄 database.js
│   │   │   │   ├── 📄 index.js
│   │   │   │   └── 📄 rabbitmq.js
│   │   │   ├── 📁 controllers
│   │   │   │   └── 📄 category.controller.js
│   │   │   ├── 📁 dtos
│   │   │   │   └── 📄 category.dto.js
│   │   │   ├── 📁 events
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 generated
│   │   │   │   └── 📁 prisma
│   │   │   │       ├── 📁 internal
│   │   │   │       │   ├── 📄 class.ts
│   │   │   │       │   ├── 📄 prismaNamespace.ts
│   │   │   │       │   └── 📄 prismaNamespaceBrowser.ts
│   │   │   │       ├── 📁 models
│   │   │   │       │   ├── 📄 Category.ts
│   │   │   │       │   └── 📄 Icon.ts
│   │   │   │       ├── 📄 browser.ts
│   │   │   │       ├── 📄 client.ts
│   │   │   │       ├── 📄 commonInputTypes.ts
│   │   │   │       ├── 📄 enums.ts
│   │   │   │       ├── 📄 models.ts
│   │   │   │       └── 📄 query_engine-windows.dll.node
│   │   │   ├── 📁 grpc
│   │   │   │   └── 📄 category.grpc.js
│   │   │   ├── 📁 middlewares
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   ├── 📄 error.middleware.js
│   │   │   │   └── 📄 validation.middleware.js
│   │   │   ├── 📁 repositories
│   │   │   │   └── 📄 category.repository.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 category.routes.js
│   │   │   ├── 📁 services
│   │   │   │   └── 📄 category.service.js
│   │   │   ├── 📁 types
│   │   │   │   ├── 📄 category.types.js
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 utils
│   │   │   │   └── 📄 index.js
│   │   │   └── 📁 validator
│   │   │       ├── 📄 category.validator.js
│   │   │       └── 📄 index.js
│   │   ├── 📁 tests
│   │   ├── ⚙️ .gitignore
│   │   ├── 🐳 Dockerfile
│   │   ├── 📄 app.js
│   │   ├── ⚙️ package-lock.json
│   │   ├── ⚙️ package.json
│   │   └── 📄 prisma.config.ts
│   ├── 📁 gateway
│   │   ├── 📁 src
│   │   │   ├── 📁 config
│   │   │   │   ├── 📄 jwt.config.js
│   │   │   │   ├── 📄 rate-limit.config.js
│   │   │   │   └── 📄 routes.config.js
│   │   │   ├── 📁 middleware
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   ├── 📄 cors.middleware.js
│   │   │   │   └── 📄 rate-limit.middleware.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 index.js
│   │   │   └── 📁 utils
│   │   │       └── 📄 proxy.util.js
│   │   ├── 🐳 Dockerfile
│   │   ├── 📄 app.js
│   │   ├── ⚙️ package-lock.json
│   │   └── ⚙️ package.json
│   ├── 📁 notification_service
│   │   ├── 📁 src
│   │   │   ├── 📁 config
│   │   │   │   ├── 📄 database.js
│   │   │   │   ├── 📄 index.js
│   │   │   │   ├── 📄 rabbitmq.js
│   │   │   │   └── 📄 sendgrid.js
│   │   │   ├── 📁 controllers
│   │   │   │   └── 📄 notification.controller.js
│   │   │   ├── 📁 dtos
│   │   │   │   └── 📄 notification.dto.js
│   │   │   ├── 📁 events
│   │   │   │   ├── 📁 consumers
│   │   │   │   │   ├── 📄 balance-update.consumer.js
│   │   │   │   │   ├── 📄 transaction-created.consumer.js
│   │   │   │   │   └── 📄 user-registered.consumer.js
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 jobs
│   │   │   │   └── 📄 monthly-report.job.js
│   │   │   ├── 📁 middlewares
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   ├── 📄 error.middleware.js
│   │   │   │   └── 📄 validation.middleware.js
│   │   │   ├── 📁 repositories
│   │   │   │   └── 📄 notification.repository.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 notification.routes.js
│   │   │   ├── 📁 services
│   │   │   │   └── 📄 notification.service.js
│   │   │   ├── 📁 templates
│   │   │   │   ├── 🌐 monthly-report.html
│   │   │   │   ├── 🌐 password-reset.html
│   │   │   │   ├── 🌐 transaction-created.html
│   │   │   │   └── 🌐 welcome.html
│   │   │   ├── 📁 types
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 utils
│   │   │   │   └── 📄 index.js
│   │   │   └── 📁 validator
│   │   │       └── 📄 index.js
│   │   ├── 📁 tests
│   │   ├── 🐳 Dockerfile
│   │   ├── 📄 app.js
│   │   ├── ⚙️ package-lock.json
│   │   └── ⚙️ package.json
│   ├── 📁 shared
│   │   ├── 📁 common-utils
│   │   ├── 📁 dotnet-shared
│   │   │   └── 📁 RabbitMQ.Client.Shared
│   │   │       ├── 📄 Class1.cs
│   │   │       ├── 📄 IRabbitMQClient.cs
│   │   │       ├── 📄 RabbitMQ.Client.Shared.csproj
│   │   │       └── 📄 RabbitMQClient.cs
│   │   ├── 📁 protos
│   │   │   ├── 📄 account.proto
│   │   │   ├── 📄 category.proto
│   │   │   ├── 📄 index.js
│   │   │   └── ⚙️ package.json
│   │   └── 📁 rabbitmq-client
│   │       ├── 📁 src
│   │       │   └── 📄 index.js
│   │       ├── ⚙️ package-lock.json
│   │       └── ⚙️ package.json
│   ├── 📁 transaction_service
│   │   ├── 📁 src
│   │   │   ├── 📁 TransactionService.API
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   └── 📄 TransactionsController.cs
│   │   │   │   ├── 📁 Filters
│   │   │   │   │   └── 📄 ValidationFilter.cs
│   │   │   │   ├── 📁 Middlewares
│   │   │   │   │   └── 📄 ErrorHandlingMiddleware.cs
│   │   │   │   ├── 📁 Properties
│   │   │   │   │   └── ⚙️ launchSettings.json
│   │   │   │   ├── 📁 Workers
│   │   │   │   │   └── 📄 TransactionBackgroundWorker.cs
│   │   │   │   ├── 📄 Program.cs
│   │   │   │   ├── 📄 TransactionService.API.csproj
│   │   │   │   └── 📄 TransactionService.API.http
│   │   │   ├── 📁 TransactionService.Application
│   │   │   │   ├── 📁 Mappings
│   │   │   │   │   └── 📄 AutoMapperTransaction.cs
│   │   │   │   ├── 📁 Services
│   │   │   │   │   └── 📄 TransactionService.cs
│   │   │   │   ├── 📁 Validators
│   │   │   │   │   └── 📄 CreateTransactionValidator.cs
│   │   │   │   ├── 📄 Class1.cs
│   │   │   │   └── 📄 TransactionService.Application.csproj
│   │   │   ├── 📁 TransactionService.Core
│   │   │   │   ├── 📁 DTOs
│   │   │   │   │   ├── 📄 CreateTransactionRequestDto.cs
│   │   │   │   │   ├── 📄 CreateTransactionResponseDto.cs
│   │   │   │   │   ├── 📄 TransactionDto.cs
│   │   │   │   │   └── 📄 TransactionResponseDto.cs
│   │   │   │   ├── 📁 Entities
│   │   │   │   │   └── 📄 Transaction.cs
│   │   │   │   ├── 📁 Exceptions
│   │   │   │   │   └── 📄 BusinessException.cs
│   │   │   │   ├── 📁 Interfaces
│   │   │   │   │   ├── 📄 IAccountInternalService.cs
│   │   │   │   │   ├── 📄 IRabbitMQPublisher.cs
│   │   │   │   │   ├── 📄 ITransactionRepository.cs
│   │   │   │   │   └── 📄 ITransactionService.cs
│   │   │   │   ├── 📄 Class1.cs
│   │   │   │   └── 📄 TransactionService.Core.csproj
│   │   │   └── 📁 TransactionService.Infrastructure
│   │   │       ├── 📁 Data
│   │   │       │   ├── 📄 TransactionDbContexFactory.cs
│   │   │       │   └── 📄 TransactionDbContext.cs
│   │   │       ├── 📁 Extensions
│   │   │       │   └── 📄 ServiceCollectionExtension.cs
│   │   │       ├── 📁 MessageBroker
│   │   │       │   └── 📄 RabbitMQPublisher.cs
│   │   │       ├── 📁 Repositories
│   │   │       │   └── 📄 TransactionRepository.cs
│   │   │       ├── 📁 Services
│   │   │       │   └── 📄 AccountInternalService.cs
│   │   │       ├── 📁 src
│   │   │       │   ├── 📁 TransactionService
│   │   │       │   │   └── 📁 Infrastructure
│   │   │       │   │       └── 📁 Data
│   │   │       │   └── 📁 TransactionService.Infrastructure
│   │   │       │       └── 📁 Data
│   │   │       ├── 📄 Class1.cs
│   │   │       └── 📄 TransactionService.Infrastructure.csproj
│   │   ├── 📁 tests
│   │   └── 🐳 Dockerfile
│   └── 📁 user_service
│       ├── 📁 prisma
│       │   └── 📄 schema.prisma
│       ├── 📁 src
│       │   ├── 📁 config
│       │   │   ├── 📄 database.js
│       │   │   ├── 📄 index.js
│       │   │   └── 📄 rabbitmq.js
│       │   ├── 📁 controllers
│       │   │   └── 📄 user.controller.js
│       │   ├── 📁 dtos
│       │   │   ├── 📄 user.consume.dto.js
│       │   │   ├── 📄 user.dto.js
│       │   │   └── 📄 user.publish.event.js
│       │   ├── 📁 events
│       │   │   ├── 📁 consumer
│       │   │   │   └── 📄 user-create.consumer.js
│       │   │   ├── 📄 index.js
│       │   │   └── 📄 routingKey.config.js
│       │   ├── 📁 middlewares
│       │   │   ├── 📄 auth.middleware.js
│       │   │   ├── 📄 error.middleware.js
│       │   │   └── 📄 validation.middleware.js
│       │   ├── 📁 repositories
│       │   │   └── 📄 user.repository.js
│       │   ├── 📁 routes
│       │   │   └── 📄 user.routes.js
│       │   ├── 📁 services
│       │   │   └── 📄 user.service.js
│       │   ├── 📁 types
│       │   │   ├── 📄 index.js
│       │   │   └── 📄 user.types.js
│       │   ├── 📁 utils
│       │   │   └── 📄 index.js
│       │   └── 📁 validator
│       │       ├── 📄 index.js
│       │       └── 📄 user.validator.js
│       ├── 📁 tests
│       ├── ⚙️ .gitignore
│       ├── 🐳 Dockerfile
│       ├── 📄 app.js
│       ├── ⚙️ package-lock.json
│       ├── ⚙️ package.json
│       └── 📄 prisma.config.ts
├── 📁 data
│   ├── 📄 analytics_schema.js
│   ├── 📄 schema_test.sql
│   ├── 📄 transactions_2025_jan_oct.sql
│   └── 📄 transactions_with_user_id.sql
├── 📁 frontend
│   ├── 📁 public
│   │   └── 🖼️ vite.svg
│   ├── 📁 src
│   │   ├── 📁 assets
│   │   │   └── 🖼️ react.svg
│   │   ├── 🎨 App.css
│   │   ├── 📄 App.jsx
│   │   ├── 🎨 index.css
│   │   └── 📄 main.jsx
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 eslint.config.js
│   ├── 🌐 index.html
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   └── 📄 vite.config.js
├── ⚙️ .dockerignore
├── ⚙️ .gitignore
├── 📝 README.md
├── ⚙️ docker-compose.yml
└── ⚙️ package-lock.json
```
