using TransactionService.Core.DTOs;

namespace TransactionService.Core.Interfaces
{
    public interface ICategoryInternalService
    {
        Task<bool> ValidateCategoryAsync(Guid categoryId, Guid userId, String transactionType);

        Task<CategoryDisplayDto> GetCategoryDisplayAsync(Guid categoryId, Guid userId, string transactionType);
    }
}