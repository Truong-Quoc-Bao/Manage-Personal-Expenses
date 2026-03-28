using Microsoft.EntityFrameworkCore;
using TransactionService.Core.Entities;

namespace TransactionSevice.Infrastructure.Data
{
    public class TransactionDbContext : DbContext
    {
        public TransactionDbContext(DbContextOptions<TransactionDbContext> options) : base(options)
        {
        }

        public DbSet<Transaction> Transactions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("transaction_service");
            
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("transactions"); 
                
                entity.HasKey(e => e.TransId);

                entity.Property(e => e.Amount)
                    .HasPrecision(15, 2); 

                entity.Property(e => e.Date)
                    .HasColumnType("date");

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            base.OnModelCreating(modelBuilder);
        }

    }
}