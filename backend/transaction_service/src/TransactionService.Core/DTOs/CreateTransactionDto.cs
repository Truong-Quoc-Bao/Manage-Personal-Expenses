using System.ComponentModel.DataAnnotations;

namespace TransactionService.Core.DTOs
{
    public class CreateTransactionDto
    {
        public Guid AccountId { get; set; }

        public Guid? CategoryId { get; set; }

        public decimal Amount { get; set; }

        public string? TransactionType { get; set; }

        public string? Description { get; set; }

        public DateOnly Date { get; set; }

        public string? Note { get; set; }
    }
}