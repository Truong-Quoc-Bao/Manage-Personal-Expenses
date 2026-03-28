using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransactionService.Core.Entities
{
    [Table("transactions")]
    public class Transaction
    {
        [Key]
        [Column("trans_id")]
        public Guid TransId { get; set; } = Guid.NewGuid();

        [Column("account_id")]
        public Guid AccountId { get; set; }

        [Column("category_id")]
        public Guid? CategoryId { get; set; }

        [Column("amount")]
        public decimal Amount { get; set; }

        [MaxLength(50)]
        [Column("transaction_type")]
        public string? TransactionType { get; set; }

        [MaxLength(255)]
        [Column("description")]
        public string? Description { get; set; }

        [Column("date")]
        public DateOnly Date { get; set; }

        [MaxLength(255)]
        [Column("note")]
        public string? Note { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
