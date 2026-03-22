FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ./src ./src

WORKDIR /src/TransactionService.API
RUN dotnet restore

RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 3007
ENV ASPNETCORE_URLS=http://+:3007

ENTRYPOINT ["dotnet", "TransactionService.API.dll"]