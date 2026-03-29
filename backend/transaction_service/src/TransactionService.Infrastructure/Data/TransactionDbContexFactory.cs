using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace TransactionService.Infrastructure.Data
{
    public class TransactionDbContextFactory : IDesignTimeDbContextFactory<TransactionDbContext>
    {
        public TransactionDbContext CreateDbContext(string[] args)
        {
            string path = Path.Combine(Directory.GetCurrentDirectory(), "../TransactionService.API");

            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(path)
                .AddJsonFile("appsettings.json")
                .AddJsonFile("appsettings.Development.json", optional: true)
                .Build();


            var connectionString = configuration.GetConnectionString("DefaultConnection");
            
            var optionsBuilder = new DbContextOptionsBuilder<TransactionDbContext>();
            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure();
                npgsqlOptions.CommandTimeout(30);
            });

            return new TransactionDbContext(optionsBuilder.Options);
        }
    }
}