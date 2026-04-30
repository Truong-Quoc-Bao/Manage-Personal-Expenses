namespace TransactionService.Core.Interfaces
{
    public interface ICategoryInternalService
    {
        Task<bool> ValidateCategoryAsync(Guid categoryId, Guid userId, String transactionType);
    }
}