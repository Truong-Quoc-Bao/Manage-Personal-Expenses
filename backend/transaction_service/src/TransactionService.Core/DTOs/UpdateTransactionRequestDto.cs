using System.ComponentModel.DataAnnotations;
using TransactionService.Core.Entities;

namespace TransactionService.Core.DTOs
{
    public class UpdateTransactionRequestDto
    {
        [Required]
        public Guid AccountId { get; set; }
        
        public Guid? CategoryId { get; set; }

        [Required(ErrorMessage = "Số tiền là bắt buộc.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền phải lớn hơn 0.")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Loại giao dịch là bắt buộc.")]
        [EnumDataType(typeof(TransactionType), ErrorMessage = "TransactionType phải là Income hoặc Expense.")]
        public TransactionType TransactionType { get; set; }

        public string? Description { get; set; }

        [Required(ErrorMessage = "Ngày giao dịch là bắt buộc.")]
        public DateOnly Date { get; set; }

        [MaxLength(255)]
        public string? Note { get; set; }
    }
}