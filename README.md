# File Tree: DA

**Generated:** 3/26/2026, 3:46:18 PM
**Root Path:** `f:\Project_Dat\SGU\DACN\DA`

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
│   │   │   │   └── 📁 publishers
│   │   │   │       └── 📄 balance-update.publisher.js
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
│   │   │   ├── 📁 validators
│   │   │   │   └── 📄 index.js
│   │   │   └── 📄 app.js
│   │   ├── 📁 tests
│   │   ├── ⚙️ .gitignore
│   │   ├── 🐳 Dockerfile
│   │   ├── ⚙️ package-lock.json
│   │   ├── ⚙️ package.json
│   │   └── 📄 prisma.config.ts
│   ├── 📁 analytics_service
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
│   │   │   │   └── 📁 consumers
│   │   │   │       └── 📄 transaction-events.consumer.js
│   │   │   ├── 📁 middlewares
│   │   │   │   ├── 📄 auth.middleware.js
│   │   │   │   ├── 📄 error.middleware.js
│   │   │   │   └── 📄 validation.middleware.js
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
│   │   │   ├── 📁 validators
│   │   │   │   └── 📄 analytics.validator.js
│   │   │   └── 📄 app.js
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
│   │   │   │   ├── 📄 AuthService.API.csproj
│   │   │   │   ├── 📄 AuthService.API.http
│   │   │   │   ├── 📄 Program.cs
│   │   │   │   └── ⚙️ appsettings.json
│   │   │   ├── 📁 AuthService.Application
│   │   │   │   ├── 📁 Mappings
│   │   │   │   │   └── 📄 AutoMapper.cs
│   │   │   │   ├── 📁 Services
│   │   │   │   │   ├── 📄 AuthService.cs
│   │   │   │   │   └── 📄 TokenService.cs
│   │   │   │   ├── 📁 Validators
│   │   │   │   │   └── 📄 index.cs
│   │   │   │   ├── 📄 AuthService.Application.csproj
│   │   │   │   └── 📄 Class1.cs
│   │   │   ├── 📁 AuthService.Core
│   │   │   │   ├── 📁 DTOs
│   │   │   │   │   ├── 📄 LoginRequestDto.cs
│   │   │   │   │   ├── 📄 LoginResponseDto.cs
│   │   │   │   │   └── 📄 RegisterRequestDto.cs
│   │   │   │   ├── 📁 Entities
│   │   │   │   │   └── 📄 AuthSession.cs
│   │   │   │   ├── 📁 Interfaces
│   │   │   │   │   ├── 📄 IAuthRepository.cs
│   │   │   │   │   └── 📄 ITokenService.cs
│   │   │   │   ├── 📄 AuthService.Core.csproj
│   │   │   │   └── 📄 Class1.cs
│   │   │   └── 📁 AuthService.Infrastructure
│   │   │       ├── 📁 Data
│   │   │       │   └── 📄 AppDbContext.cs
│   │   │       ├── 📁 MessageBroker
│   │   │       │   └── 📄 RabbitMQPublisher.cs
│   │   │       ├── 📄 AuthService.Infrastructure.csproj
│   │   │       └── 📄 Class1.cs
│   │   └── 🐳 Dockerfile
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
│   │   │   ├── 📁 validator
│   │   │   │   ├── 📄 category.validator.js
│   │   │   │   └── 📄 index.js
│   │   │   └── 📄 app.js
│   │   ├── 📁 tests
│   │   ├── ⚙️ .gitignore
│   │   ├── 🐳 Dockerfile
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
│   │   │   │   └── 📄 auth.middleware.js
│   │   │   ├── 📁 routes
│   │   │   │   └── 📄 index.js
│   │   │   ├── 📁 utils
│   │   │   │   └── 📄 proxy.util.js
│   │   │   ├── 📄 app.js
│   │   │   ├── 📄 cors.middleware.js
│   │   │   └── 📄 rate-limit.middleware.js
│   │   ├── 🐳 Dockerfile
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
│   │   │   │   └── 📁 consumers
│   │   │   │       ├── 📄 balance-update.consumer.js
│   │   │   │       ├── 📄 transaction-created.consumer.js
│   │   │   │       └── 📄 user-registered.consumer.js
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
│   │   │   ├── 📁 validator
│   │   │   │   └── 📄 index.js
│   │   │   └── 📄 app.js
│   │   ├── 📁 tests
│   │   ├── 🐳 Dockerfile
│   │   ├── ⚙️ package-lock.json
│   │   └── ⚙️ package.json
│   ├── 📁 shared
│   ├── 📁 transaction_service
│   │   ├── 📁 src
│   │   │   ├── 📁 TransactionService.API
│   │   │   │   ├── 📁 Controllers
│   │   │   │   │   └── 📄 TransactionsController.cs
│   │   │   │   ├── 📁 Extensions
│   │   │   │   │   └── 📄 ServiceCollectionExtension.cs
│   │   │   │   ├── 📁 Filters
│   │   │   │   │   └── 📄 ValidationFilter
│   │   │   │   ├── 📁 Middlewares
│   │   │   │   │   ├── 📄 ErrorHandlingMiddleware.cs
│   │   │   │   │   └── 📄 JwtAuthMiddleware.cs
│   │   │   │   ├── 📁 Properties
│   │   │   │   │   └── ⚙️ launchSettings.json
│   │   │   │   ├── 📄 Program.cs
│   │   │   │   ├── 📄 TransactionService.API.csproj
│   │   │   │   ├── 📄 TransactionService.API.http
│   │   │   │   └── ⚙️ appsettings.json
│   │   │   ├── 📁 TransactionService.Application
│   │   │   │   ├── 📁 Mappings
│   │   │   │   │   └── 📄 AutoMapper.cs
│   │   │   │   ├── 📁 Services
│   │   │   │   │   ├── 📄 ITransactionService.cs
│   │   │   │   │   └── 📄 TransactionService.cs
│   │   │   │   ├── 📁 Validators
│   │   │   │   │   └── 📄 CreateTransactionValidator.cs
│   │   │   │   ├── 📄 Class1.cs
│   │   │   │   └── 📄 TransactionService.Application.csproj
│   │   │   ├── 📁 TransactionService.Core
│   │   │   │   ├── 📁 DTOs
│   │   │   │   │   ├── 📄 CreateTransactionDto.cs
│   │   │   │   │   └── 📄 TransactionDto.cs
│   │   │   │   ├── 📁 Entities
│   │   │   │   │   ├── 📄 Account.cs
│   │   │   │   │   └── 📄 Transaction.cs
│   │   │   │   ├── 📁 Exceptions
│   │   │   │   │   └── 📄 BusinessException.cs
│   │   │   │   ├── 📁 Interfaces
│   │   │   │   │   ├── 📄 IMessagePublisher.cs
│   │   │   │   │   ├── 📄 ITransactionRepository.cs
│   │   │   │   │   └── 📄 IUnitOfWork.cs
│   │   │   │   ├── 📄 Class1.cs
│   │   │   │   └── 📄 TransactionService.Core.csproj
│   │   │   └── 📁 TransactionService.Infrastructure
│   │   │       ├── 📁 Data
│   │   │       │   └── 📁 Repositories
│   │   │       │       └── 📄 TransactionRepository.cs
│   │   │       ├── 📁 MessageBroker
│   │   │       │   ├── 📄 RabbitMQConfig.cs
│   │   │       │   └── 📄 RabbitMQPublisher.cs
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
│       │   │   └── 📄 user.dto.js
│       │   ├── 📁 events
│       │   │   └── 📄 index.js
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
│       │   ├── 📁 validator
│       │   │   ├── 📄 index.js
│       │   │   └── 📄 user.validator.js
│       │   └── 📄 app.js
│       ├── 📁 tests
│       ├── ⚙️ .gitignore
│       ├── 🐳 Dockerfile
│       ├── ⚙️ package-lock.json
│       ├── ⚙️ package.json
│       └── 📄 prisma.config.ts
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
├── ⚙️ .gitignore
├── 📝 README.md
├── ⚙️ docker-compose.yml
└── 📄 schema_test.sql
```
