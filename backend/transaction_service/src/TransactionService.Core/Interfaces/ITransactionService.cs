using TransactionService.Core.DTOs;

namespace TransactionService.Core.Interfaces
{
    public interface ITransactionService
    {
        Task<List<TransactionResponseDto>> GetAllTransactionsAsync(Guid userId, Guid? categoryId = null, bool includeCategoryDetails = false);

        Task<TransactionResponseDto?> GetTransactionByIdAsync(Guid userId, Guid transactionId, bool includeCategoryDetails = false);

        Task<TransactionResponseDto> CreateTransactionAsync(Guid userId, CreateTransactionRequestDto request);
    }
}