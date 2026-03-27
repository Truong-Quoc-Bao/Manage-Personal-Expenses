FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ./src/AuthService.API/*.csproj ./AuthService.API/
COPY ./src/AuthService.Application/*.csproj ./AuthService.Application/
COPY ./src/AuthService.Core/*.csproj ./AuthService.Core/
COPY ./src/AuthService.Infrastructure/*.csproj ./AuthService.Infrastructure/

COPY ./src .

WORKDIR /src/AuthService.API
RUN dotnet restore

RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 3006
ENV ASPNETCORE_URLS=http://+:3006

ENTRYPOINT ["dotnet", "AuthService.API.dll"]

# =============================================
# DEVELOPMENT STAGE (cho hot reload)
# =============================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS development

WORKDIR /src

COPY ./src/AuthService.API/*.csproj ./AuthService.API/
COPY ./src/AuthService.Application/*.csproj ./AuthService.Application/
COPY ./src/AuthService.Core/*.csproj ./AuthService.Core/
COPY ./src/AuthService.Infrastructure/*.csproj ./AuthService.Infrastructure/

RUN dotnet restore "./AuthService.API/AuthService.API.csproj"

COPY ./src ./

WORKDIR /src/AuthService.API

EXPOSE 3006
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:3006
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV DOTNET_WATCH_SUPPRESS_EMOJIS=1

CMD ["dotnet", "watch", "run", "--no-launch-profile", "--urls", "http://0.0.0.0:3006"]