using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using RabbitMQ.Client.Shared;
using TransactionService.Infrastructure.Data;
using TransactionService.Core.Interfaces;
using TransactionService.Infrastructure.MessageBroker;
using TransactionService.Infrastructure.Protos;
using TransactionService.Infrastructure.Services;

namespace TransactionService.Infrastructure.Extensions
{
    public static class ServiceCollectionExtension
    {
        public static IServiceCollection AddTransactionInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            var rabbitMQConnectionString = configuration.GetConnectionString("RabbitMQConnection");

            services.AddSingleton<IRabbitMQClient>(sp => new RabbitMQClient(rabbitMQConnectionString));

            services.AddScoped<IRabbitMQPublisher, RabbitMQPublisher>();

            services.AddDbContext<TransactionDbContext>(options =>
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure();
                    npgsqlOptions.CommandTimeout(30);
                });
            });

            services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options => options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"])),                    
                });

            services.AddGrpcClient<CategoryProtoService.CategoryProtoServiceClient>(options =>
            {
                options.Address = new Uri(configuration["GrpcSettings:CategoryServiceUrl"]!);
            });

            services.AddGrpcClient<AccountProtoService.AccountProtoServiceClient>(options =>
            {
                options.Address = new Uri(configuration["GrpcSettings:AccountServiceUrl"]!);
            });
                
            services.AddScoped<IAccountInternalService, AccountInternalService>();

            return services;
        }
    }
}