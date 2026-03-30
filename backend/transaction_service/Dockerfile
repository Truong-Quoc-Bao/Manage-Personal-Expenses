FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY ["backend/shared/dotnet-shared/RabbitMQ.Client.Shared/RabbitMQ.Client.Shared.csproj", "backend/shared/dotnet-shared/RabbitMQ.Client.Shared/"]
COPY ["backend/transaction_service/src/TransactionService.API/TransactionService.API.csproj", "backend/transaction_service/src/TransactionService.API/"]
COPY ["backend/transaction_service/src/TransactionService.Application/TransactionService.Application.csproj", "backend/transaction_service/src/TransactionService.Application/"]
COPY ["backend/transaction_service/src/TransactionService.Core/TransactionService.Core.csproj", "backend/transaction_service/src/TransactionService.Core/"]
COPY ["backend/transaction_service/src/TransactionService.Infrastructure/TransactionService.Infrastructure.csproj", "backend/transaction_service/src/TransactionService.Infrastructure/"]

RUN dotnet restore "backend/transaction_service/src/TransactionService.API/TransactionService.API.csproj"

COPY backend/shared/dotnet-shared/ ./backend/shared/dotnet-shared/
COPY backend/transaction_service/ ./backend/transaction_service/

WORKDIR "/app/backend/transaction_service/src/TransactionService.API"
RUN dotnet publish "TransactionService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 3007
ENV ASPNETCORE_URLS=http://+:3007
ENTRYPOINT ["dotnet", "TransactionService.API.dll"]


# =============================================
# DEVELOPMENT STAGE (cho hot reload)
# =============================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development

WORKDIR /app

COPY ["backend/shared/dotnet-shared/RabbitMQ.Client.Shared/RabbitMQ.Client.Shared.csproj", "backend/shared/dotnet-shared/RabbitMQ.Client.Shared/"]
COPY ["backend/transaction_service/src/TransactionService.API/TransactionService.API.csproj", "backend/transaction_service/src/TransactionService.API/"]
COPY ["backend/transaction_service/src/TransactionService.Application/TransactionService.Application.csproj", "backend/transaction_service/src/TransactionService.Application/"]
COPY ["backend/transaction_service/src/TransactionService.Core/TransactionService.Core.csproj", "backend/transaction_service/src/TransactionService.Core/"]
COPY ["backend/transaction_service/src/TransactionService.Infrastructure/TransactionService.Infrastructure.csproj", "backend/transaction_service/src/TransactionService.Infrastructure/"]

RUN dotnet restore "backend/transaction_service/src/TransactionService.API/TransactionService.API.csproj"

COPY backend/shared/dotnet-shared/ ./backend/shared/dotnet-shared/
COPY backend/transaction_service/ ./backend/transaction_service/

WORKDIR "/app/backend/transaction_service/src/TransactionService.API"

EXPOSE 3007
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:3007
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV DOTNET_WATCH_SUPPRESS_EMOJIS=1

CMD ["dotnet", "watch", "run", "--no-launch-profile", "--urls", "http://0.0.0.0:3007"]