using System.ComponentModel.DataAnnotations;

namespace TransactionService.Core.DTOs
{
    public class TransactionResponseDto
    {
        [Required]
        public Guid TransId { get; set; }
        [Required]
        public Guid AccountId { get; set; }

        [Required]
        public Guid? CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public string? CategoryColor { get; set; }

        public string? CategoryIconCode { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string? TransactionType { get; set; }

        public string? Description { get; set; }

        public DateTime Date { get; set; }

        public string? Note { get; set; }
    }
}