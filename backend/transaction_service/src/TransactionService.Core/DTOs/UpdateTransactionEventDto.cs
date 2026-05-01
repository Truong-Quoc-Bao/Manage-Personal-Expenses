using System.ComponentModel.DataAnnotations;

namespace TransactionService.Core.DTOs
{
    public class UpdateTransactionEventDto
    {
        [Required]
        public Guid TransId { get; set; }
        [Required]
        public Guid AccountId { get; set; }
        
        [Required]
        public Guid? CategoryId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string TransactionType { get; set; }

    }
}