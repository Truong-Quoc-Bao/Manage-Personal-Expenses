FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY ["backend/shared/dotnet-shared/RabbitMQ.Client.Shared/RabbitMQ.Client.Shared.csproj", "backend/shared/dotnet-shared/RabbitMQ.Client.Shared/"]
COPY ["backend/auth_service/src/AuthService.API/AuthService.API.csproj", "backend/auth_service/src/AuthService.API/"]
COPY ["backend/auth_service/src/AuthService.Application/AuthService.Application.csproj", "backend/auth_service/src/AuthService.Application/"]
COPY ["backend/auth_service/src/AuthService.Core/AuthService.Core.csproj", "backend/auth_service/src/AuthService.Core/"]
COPY ["backend/auth_service/src/AuthService.Infrastructure/AuthService.Infrastructure.csproj", "backend/auth_service/src/AuthService.Infrastructure/"]

RUN dotnet restore "backend/auth_service/src/AuthService.API/AuthService.API.csproj"

COPY backend/shared/dotnet-shared/ ./backend/shared/dotnet-shared/
COPY backend/shared/protos/ ./backend/shared/protos/
COPY backend/auth_service/ ./backend/auth_service/

WORKDIR "/app/backend/auth_service/src/AuthService.API"
RUN dotnet publish "AuthService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 3006
ENV ASPNETCORE_URLS=http://+:3006
ENTRYPOINT ["dotnet", "AuthService.API.dll"]

# =============================================
# DEVELOPMENT STAGE (cho hot reload)
# =============================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development

WORKDIR /app

COPY ["backend/shared/dotnet-shared/RabbitMQ.Client.Shared/RabbitMQ.Client.Shared.csproj", "backend/shared/dotnet-shared/RabbitMQ.Client.Shared/"]
COPY ["backend/auth_service/src/AuthService.API/AuthService.API.csproj", "backend/auth_service/src/AuthService.API/"]
COPY ["backend/auth_service/src/AuthService.Application/AuthService.Application.csproj", "backend/auth_service/src/AuthService.Application/"]
COPY ["backend/auth_service/src/AuthService.Core/AuthService.Core.csproj", "backend/auth_service/src/AuthService.Core/"]
COPY ["backend/auth_service/src/AuthService.Infrastructure/AuthService.Infrastructure.csproj", "backend/auth_service/src/AuthService.Infrastructure/"]

RUN dotnet restore "backend/auth_service/src/AuthService.API/AuthService.API.csproj"

COPY backend/shared/dotnet-shared/ ./backend/shared/dotnet-shared/
COPY backend/auth_service/ ./backend/auth_service/

WORKDIR "/app/backend/auth_service/src/AuthService.API"

EXPOSE 3006
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:3006
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV DOTNET_WATCH_SUPPRESS_EMOJIS=1

CMD ["dotnet", "watch", "run", "--no-launch-profile", "--urls", "http://0.0.0.0:3006"]