FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ./src ./src

WORKDIR /src/AuthService.API
RUN dotnet restore

RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 3006
ENV ASPNETCORE_URLS=http://+:3006

ENTRYPOINT ["dotnet", "AuthService.API.dll"]