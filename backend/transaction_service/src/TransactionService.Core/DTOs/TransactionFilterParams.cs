namespace TransactionService.Core.DTOs
{
    public class TransactionFilterParams
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? TransactionType { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? AccountId { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
    }
}
