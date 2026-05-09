using System.ComponentModel.DataAnnotations;

namespace TransactionService.Core.DTOs
{
    public class UpdateTransactionEventDto
    {
        [Required]
        public Guid TransId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid AccountId { get; set; }

        public Guid? AccountIdUpdate { get; set; }

        [Required]
        public Guid? CategoryId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        public decimal AmountUpdate { get; set; } = 0;

        [Required]
        public string TransactionType { get; set; }

        public string? TransactionTypeUpdate { get; set; }

        public string? CategoryName { get; set; }

        public string? AccountName { get; set; }

        public string? Description { get; set; }

        public DateTime Date { get; set; }

        public string? Note { get; set; }
    }
}