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
│   │   │   │   │   ├── 📄 transaction_created.consumer.js
│   │   │   │   │   ├── 📄 transaction_deleted.consumer.js
│   │   │   │   │   └── 📄 transaction_updated.consumer.js
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
│   ├── 📁 ai_service
│   │   ├── 📁 public
│   │   │   ├── 🌐 Google AI Studio.html
│   │   │   ├── 🖼️ badge.png
│   │   │   ├── 🖼️ icon-192.png
│   │   │   ├── 🌐 index.html
│   │   │   ├── 🌐 index2.html
│   │   │   ├── ⚙️ manifest.json
│   │   │   ├── 📄 script-cũ.js
│   │   │   ├── 📄 script.js
│   │   │   ├── 🌐 sepay-error.html
│   │   │   ├── 🎨 style.css
│   │   │   └── 📄 sw.js
│   │   ├── 🐳 Dockerfile
│   │   ├── 📄 aiValidators.js
│   │   ├── 📄 ai_cũ.js
│   │   ├── 📄 app.js
│   │   ├── 📄 check_models.js
│   │   ├── ⚙️ package-lock.json
│   │   ├── ⚙️ package.json
│   │   ├── 📄 proxy.js
│   │   ├── 📄 super_check.js
│   │   ├── 📄 systemRules.js
│   │   └── 📄 test.js
│   ├── 📁 analytics_service
│   │   ├── 📁 database
│   │   │   ├── 📄 init.mongo.js
│   │   │   ├── 📄 init_mongo.js
│   │   │   ├── 📄 seed.js
│   │   │   ├── 📄 seed_accounts.js
│   │   │   ├── 📄 seed_anomaly_logs.js
│   │   │   ├── 📄 seed_category_summary.js
│   │   │   ├── 📄 seed_dashboard_cache.js
│   │   │   ├── 📄 seed_monthly_reports.js
│   │   │   ├── 📄 seed_spending_trends.js
│   │   │   ├── 📄 seed_transactions.js
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
│   │   │   │   │   ├── 📄 account-events.consumer.js
│   │   │   │   │   ├── 📄 category-events.consumer.js
│   │   │   │   │   └── 📄 transaction-events.consumer.js
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 grpc
│   │   │   │   └── 📄 analytics.grpc.js
│   │   │   ├── 📁 mapping
│   │   │   │   └── 📄 analytics.mapping.js
│   │   │   ├── 📁 middlewares
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   ├── 📄 error.middleware.js
│   │   │   │   └── 📄 validation.middleware.js
│   │   │   ├── 📁 model
│   │   │   │   ├── 📄 account.model.js
│   │   │   │   ├── 📄 anomalyLog.model.js
│   │   │   │   ├── 📄 categorySummary.model.js
│   │   │   │   ├── 📄 dashboardCache.model.js
│   │   │   │   ├── 📄 index.model.js
│   │   │   │   ├── 📄 monthlyReport.model.js
│   │   │   │   ├── 📄 spendingTrend.model.js
│   │   │   │   ├── 📄 transaction.model.js
│   │   │   │   └── 📄 userAnalytics.model.js
│   │   │   ├── 📁 repositories
│   │   │   │   └── 📄 analytics.repository.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 analytics.routes.js
│   │   │   ├── 📁 services
│   │   │   │   ├── 📄 analytics.event.service.js
│   │   │   │   └── 📄 analytics.service.js
│   │   │   ├── 📁 test api
│   │   │   │   └── 📝 postman_test_bodies.md
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
│   │   ├── 📁 src
│   │   │   ├── 📁 config
│   │   │   │   ├── 📄 database.js
│   │   │   │   ├── 📄 index.js
│   │   │   │   └── 📄 rabbitmq.js
│   │   │   ├── 📁 controllers
│   │   │   │   └── 📄 budget.controller.js
│   │   │   ├── 📁 dtos
│   │   │   │   └── 📄 budget.dto.js
│   │   │   ├── 📁 events
│   │   │   │   ├── 📁 consumers
│   │   │   │   │   ├── 📄 transaction-created.consumer.js
│   │   │   │   │   ├── 📄 transaction-deleted.consumer.js
│   │   │   │   │   └── 📄 transaction-updated.consumer.js
│   │   │   │   ├── 📁 publishers
│   │   │   │   │   └── 📄 balance-update.publisher.js
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 gRPC
│   │   │   │   ├── 📄 budget.grpc.js
│   │   │   │   └── 📄 category.client.js
│   │   │   ├── 📁 middlewares
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   ├── 📄 error.middleware.js
│   │   │   │   ├── 📄 index.js
│   │   │   │   └── 📄 validation.middleware.js
│   │   │   ├── 📁 repositories
│   │   │   │   └── 📄 budget.repository.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 budget.routes.js
│   │   │   ├── 📁 services
│   │   │   │   └── 📄 budget.service.js
│   │   │   ├── 📁 types
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 utils
│   │   │   │   └── 📄 index.js
│   │   │   └── 📁 validator
│   │   │       ├── 📄 account.validator.js
│   │   │       └── 📄 index.js
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
│   │   │   ├── 📄 analytics.proto
│   │   │   ├── 📄 budget.proto
│   │   │   ├── 📄 category.proto
│   │   │   ├── 📄 index.js
│   │   │   ├── ⚙️ package.json
│   │   │   └── 📄 user.proto
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
│   │   │   │   │   └── 📄 TransactionAppService.cs
│   │   │   │   ├── 📁 Validators
│   │   │   │   │   └── 📄 CreateTransactionValidator.cs
│   │   │   │   ├── 📄 Class1.cs
│   │   │   │   └── 📄 TransactionService.Application.csproj
│   │   │   ├── 📁 TransactionService.Core
│   │   │   │   ├── 📁 DTOs
│   │   │   │   │   ├── 📄 AccountDisplayDto.cs
│   │   │   │   │   ├── 📄 CategoryDisplayDto.cs
│   │   │   │   │   ├── 📄 CreateTransactionEventDto.cs
│   │   │   │   │   ├── 📄 CreateTransactionRequestDto.cs
│   │   │   │   │   ├── 📄 CreateTransactionResponseDto.cs
│   │   │   │   │   ├── 📄 DeleteTransactionEventDto.cs
│   │   │   │   │   ├── 📄 PaginatedResultDto.cs
│   │   │   │   │   ├── 📄 TransactionFilterParams.cs
│   │   │   │   │   ├── 📄 TransactionResponseDto.cs
│   │   │   │   │   ├── 📄 UpdateTransactionEventDto.cs
│   │   │   │   │   └── 📄 UpdateTransactionRequestDto.cs
│   │   │   │   ├── 📁 Entities
│   │   │   │   │   └── 📄 Transaction.cs
│   │   │   │   ├── 📁 Exceptions
│   │   │   │   │   └── 📄 BusinessException.cs
│   │   │   │   ├── 📁 Interfaces
│   │   │   │   │   ├── 📄 IAccountInternalService.cs
│   │   │   │   │   ├── 📄 ICategoryInternalService.cs
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
│   │   │       │   ├── 📄 AccountInternalService.cs
│   │   │       │   └── 📄 CategoryInternalService.cs
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
│   ├── 📄 insert_transactionsPhucandDat.sql
│   ├── 📄 schema_test.sql
│   ├── 📄 transactions_2025_jan_oct.sql
│   └── 📄 transactions_with_user_id.sql
├── 📁 frontend
│   ├── 📁 public
│   │   ├── 📄 sw.js
│   │   └── 🖼️ vite.svg
│   ├── 📁 src
│   │   ├── 📁 api
│   │   │   ├── 📄 account.api.ts
│   │   │   ├── 📄 ai.api.ts
│   │   │   ├── 📄 analytics.api.ts
│   │   │   ├── 📄 auth.api.ts
│   │   │   ├── 📄 axiosInstance.ts
│   │   │   ├── 📄 budget.api.ts
│   │   │   ├── 📄 category.api.ts
│   │   │   ├── 📄 transaction.api.ts
│   │   │   └── 📄 user.api.ts
│   │   ├── 📁 assets
│   │   │   └── 🖼️ react.svg
│   │   ├── 📁 components
│   │   │   ├── 📁 layouts
│   │   │   │   ├── 📄 AuthLayout.tsx
│   │   │   │   ├── 📄 FloatingChat.tsx
│   │   │   │   ├── 📄 MainLayout.tsx
│   │   │   │   └── 📄 NotifCenter.tsx
│   │   │   ├── 📁 modals
│   │   │   │   ├── 📄 AddAccountModal.tsx
│   │   │   │   ├── 📄 AddBudgetModal.tsx
│   │   │   │   ├── 📄 AddTransactionModal.tsx
│   │   │   │   ├── 📄 DeleteAccountModal.tsx
│   │   │   │   ├── 📄 DeleteBudgetModal.tsx
│   │   │   │   ├── 📄 DeleteTransactionModal.tsx
│   │   │   │   ├── 📄 EditAccountModal.tsx
│   │   │   │   ├── 📄 EditBudgetModal.tsx
│   │   │   │   ├── 📄 EditProfileModal.tsx
│   │   │   │   ├── 📄 EditTransactionModal.tsx
│   │   │   │   └── 📄 ViewProfileModal.tsx
│   │   │   └── 📁 ui
│   │   │       ├── 📄 FinanceAIChatbox.tsx
│   │   │       ├── 📄 accordion.tsx
│   │   │       ├── 📄 alert-dialog.tsx
│   │   │       ├── 📄 alert.tsx
│   │   │       ├── 📄 aspect-ratio.tsx
│   │   │       ├── 📄 avatar.tsx
│   │   │       ├── 📄 badge.tsx
│   │   │       ├── 📄 breadcrumb.tsx
│   │   │       ├── 📄 button.tsx
│   │   │       ├── 📄 calendar.tsx
│   │   │       ├── 📄 card.tsx
│   │   │       ├── 📄 carousel.tsx
│   │   │       ├── 📄 chart.tsx
│   │   │       ├── 📄 checkbox.tsx
│   │   │       ├── 📄 collapsible.tsx
│   │   │       ├── 📄 command.tsx
│   │   │       ├── 📄 context-menu.tsx
│   │   │       ├── 📄 dialog.tsx
│   │   │       ├── 📄 drawer.tsx
│   │   │       ├── 📄 dropdown-menu.tsx
│   │   │       ├── 📄 form.tsx
│   │   │       ├── 📄 hover-card.tsx
│   │   │       ├── 📄 input-otp.tsx
│   │   │       ├── 📄 input.tsx
│   │   │       ├── 📄 label.tsx
│   │   │       ├── 📄 menubar.tsx
│   │   │       ├── 📄 navigation-menu.tsx
│   │   │       ├── 📄 pagination.tsx
│   │   │       ├── 📄 popover.tsx
│   │   │       ├── 📄 progress.tsx
│   │   │       ├── 📄 radio-group.tsx
│   │   │       ├── 📄 resizable.tsx
│   │   │       ├── 📄 scroll-area.tsx
│   │   │       ├── 📄 select.tsx
│   │   │       ├── 📄 separator.tsx
│   │   │       ├── 📄 sheet.tsx
│   │   │       ├── 📄 sidebar.tsx
│   │   │       ├── 📄 skeleton.tsx
│   │   │       ├── 📄 slider.tsx
│   │   │       ├── 📄 sonner.tsx
│   │   │       ├── 📄 switch.tsx
│   │   │       ├── 📄 table.tsx
│   │   │       ├── 📄 tabs.tsx
│   │   │       ├── 📄 textarea.tsx
│   │   │       ├── 📄 toggle-group.tsx
│   │   │       ├── 📄 toggle.tsx
│   │   │       └── 📄 tooltip.tsx
│   │   ├── 📁 hooks
│   │   │   └── 📄 useSync.ts
│   │   ├── 📁 pages
│   │   │   ├── 📄 Accounts.tsx
│   │   │   ├── 📄 ApiTestPage.tsx
│   │   │   ├── 📄 Budgets.tsx
│   │   │   ├── 📄 ChatBox.tsx
│   │   │   ├── 📄 Dashboard.tsx
│   │   │   ├── 📄 ForgotPassword.tsx
│   │   │   ├── 📄 Login.tsx
│   │   │   ├── 📄 NotFound.tsx
│   │   │   ├── 📄 Register.tsx
│   │   │   ├── 📄 ResetPassword.tsx
│   │   │   ├── 📄 Statistics.tsx
│   │   │   ├── 📄 TransactionDetail.tsx
│   │   │   └── 📄 Transactions.tsx
│   │   ├── 📁 services
│   │   │   └── 📄 SocketService.ts
│   │   ├── 📁 store
│   │   │   └── 📄 mockData.ts
│   │   ├── 📁 types
│   │   │   └── 📄 transaction.ts
│   │   ├── 📁 utils
│   │   │   ├── 📄 format.ts
│   │   │   ├── 📄 use-mobile.ts
│   │   │   └── 📄 utils.ts
│   │   ├── 🎨 App.css
│   │   ├── 📄 App.tsx
│   │   ├── 🎨 index.css
│   │   ├── 📄 main.tsx
│   │   ├── 📄 routes.tsx
│   │   └── 📄 vite-env.d.ts
│   ├── ⚙️ .dockerignore
│   ├── ⚙️ .gitignore
│   ├── 🐳 Dockerfile
│   ├── 📝 README.md
│   ├── 📄 eslint.config.js
│   ├── 🌐 index.html
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── 📄 test.tsx
│   ├── ⚙️ tsconfig.json
│   └── 📄 vite.config.js
├── ⚙️ .dockerignore
├── ⚙️ .gitignore
├── 📝 README.md
├── ⚙️ docker-compose.yml
└── ⚙️ package-lock.json
```

# Run Project

## 1. Clone Repository

```bash
git clone https://github.com/letandat1607/PersonalFinanceManagementApp.git
cd PersonalFinanceManagementApp
```

---

## 2. Create Environment File

Create a `.env` file in the root directory and copy the environment variables below:

```env
# ==========================================
# Environment
# ==========================================

NODE_ENV=development

# ==========================================
# Supabase
# ==========================================

SUPABASE_PROJECT_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# ==========================================
# PostgreSQL Database URLs
# ==========================================

AUTH_DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=auth_service

USER_DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=user_service

ACCOUNT_DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=account_service

TRANSACTION_DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=transaction_service

CATEGORY_DATABASE_URL=postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres?schema=category_service

AI_DATABASE_URL=postgresql://postgres.your-project:your_password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

# ==========================================
# Redis
# ==========================================

REDIS_URL=redis://localhost:6379

# ==========================================
# RabbitMQ
# ==========================================

RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=admin
RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672

# ==========================================
# JWT Authentication
# ==========================================

JWT_SECRET=your_super_long_jwt_secret
JWT_ISSUER=finance-auth-service
JWT_AUDIENCE=finance-api

REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# ==========================================
# Frontend
# ==========================================

FRONTEND_URL=http://localhost:5173
VITE_API_GATEWAY_URL=http://localhost:3000

# ==========================================
# Service URLs
# ==========================================

GATEWAY_URL=http://gateway:3000
USER_SERVICE_URL=http://user-service:3001
ACCOUNT_SERVICE_URL=http://account-service:3002
CATEGORY_SERVICE_URL=http://category-service:3003
ANALYTICS_SERVICE_URL=http://analytics-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005
AUTH_SERVICE_URL=http://auth-service:3006
TRANSACTION_SERVICE_URL=http://transaction-service:3007
BUDGET_SERVICE_URL=http://budget-service:3008
AI_SERVICE_URL=http://finance-ai-service:4005
```

---

## 3. Run with Docker

Build and start all services:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

Stop all services:

```bash
docker compose down
```

Remove containers, networks, and volumes:

```bash
docker compose down -v
```

Rebuild containers without cache:

```bash
docker compose build --no-cache
docker compose up
```

---

## 4. Access Services

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| RabbitMQ Management | http://localhost:15672 |
| n8n | http://localhost:5678 |

---

## 5. Default RabbitMQ Credentials

```txt
Username: admin
Password: admin
```

---

## 6. Useful Docker Commands

View running containers:

```bash
docker ps
```

View logs:

```bash
docker compose logs -f
```

View logs of specific service:

```bash
docker compose logs -f gateway
```

Restart a service:

```bash
docker compose restart gateway
```

Stop a specific service:

```bash
docker compose stop gateway
```

Start a specific service:

```bash
docker compose start gateway
```