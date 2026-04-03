using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using AuthService.Infrastructure.Extensions;
using AuthService.API.Workers;
using AuthService.Application.Services;
using AuthLogic = AuthService.Application.Services.AuthService;
using AuthService.Core.Interfaces;
using AuthService.Infrastructure.Repositories;
using AuthService.API.Middlewares;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();
builder.Services.AddDataProtection();

builder.Services.AddAuthInfrastructure(builder.Configuration);
builder.Services.AddHostedService<AuthBackgroundWorker>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthLogic>();


var app = builder.Build();

app.UseAuthentication();
// app.UseAuthorization();


app.MapControllers();

app.UseMiddleware<ErrorHandlingMiddleware>();


app.Run();


