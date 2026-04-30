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
using TransactionService.Infrastructure.Repositories;

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

            services.AddScoped<ITransactionRepository, TransactionRepository>();

            services.AddDbContext<TransactionDbContext>(options =>
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure();
                    npgsqlOptions.CommandTimeout(30);
                });
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

            services.AddScoped<ICategoryInternalService, CategoryInternalService>();

            return services;
        }
    }
}