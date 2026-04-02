using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using TransactionService.Infrastructure.Extensions;
using TransactionService.API.Workers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();

builder.Services.AddTransactionInfrastructure(builder.Configuration);
builder.Services.AddHostedService<TransactionBackgroundWorker>();

var app = builder.Build();

app.MapControllers();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();

