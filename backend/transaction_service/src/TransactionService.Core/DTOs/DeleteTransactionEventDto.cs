using System.ComponentModel.DataAnnotations;

namespace TransactionService.Core.DTOs
{
    public class DeleteTransactionEventDto
    {
        [Required]
        public Guid TransId { get; set; }

        [Required]
        public Guid UserId { get; set; }
        
        [Required]
        public Guid AccountId { get; set; }
        
        [Required]
        public Guid? CategoryId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string TransactionType { get; set; }
        
        public string? Description { get; set; }

        public DateOnly Date { get; set; }

        public string? Note { get; set; }

    }
}