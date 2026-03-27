FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ./src/TransactionService.API/*.csproj ./TransactionService.API/
COPY ./src/TransactionService.Application/*.csproj ./TransactionService.Application/
COPY ./src/TransactionService.Core/*.csproj ./TransactionService.Core/
COPY ./src/TransactionService.Infrastructure/*.csproj ./TransactionService.Infrastructure/

COPY ./src .

WORKDIR /src/TransactionService.API
RUN dotnet restore

RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 3007
ENV ASPNETCORE_URLS=http://+:3007

ENTRYPOINT ["dotnet", "TransactionService.API.dll"]


# =============================================
# DEVELOPMENT STAGE (cho hot reload)
# =============================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development

WORKDIR /src

COPY ./src/TransactionService.API/*.csproj ./TransactionService.API/
COPY ./src/TransactionService.Application/*.csproj ./TransactionService.Application/
COPY ./src/TransactionService.Core/*.csproj ./TransactionService.Core/
COPY ./src/TransactionService.Infrastructure/*.csproj ./TransactionService.Infrastructure/

RUN dotnet restore "./TransactionService.API/TransactionService.API.csproj"

COPY ./src ./

WORKDIR /src/TransactionService.API

EXPOSE 3007
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:3007
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV DOTNET_WATCH_SUPPRESS_EMOJIS=1

CMD ["dotnet", "watch", "run", "--no-launch-profile", "--urls", "http://0.0.0.0:3007"]