using Microsoft.EntityFrameworkCore;
using TransactionService.Core.Entities;

namespace TransactionService.Infrastructure.Data
{
    public class TransactionDbContext : DbContext
    {
        public TransactionDbContext(DbContextOptions<TransactionDbContext> options) : base(options)
        {
        }

        public DbSet<Transaction> Transactions { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            NormalizeDateTimesToUtc();
            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            NormalizeDateTimesToUtc();
            return base.SaveChanges();
        }

        private void NormalizeDateTimesToUtc()
        {
            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State is not (EntityState.Added or EntityState.Modified))
                    continue;

                foreach (var prop in entry.Properties)
                {
                    if (prop.CurrentValue is DateTime dt && dt.Kind != DateTimeKind.Utc)
                    {
                        prop.CurrentValue = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                    }
                }
            }
        }

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
                    .HasColumnType("timestamptz");

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.TransactionType)
                    .HasConversion(
                        v => v.ToString().ToLower(), 
                        v => (TransactionType)Enum.Parse(typeof(TransactionType), v, true)
                    )
                    .HasColumnType("varchar(50)");
            });

            base.OnModelCreating(modelBuilder);
        }

    }
}