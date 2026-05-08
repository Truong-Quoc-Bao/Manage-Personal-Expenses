using TransactionService.Core.DTOs;

namespace TransactionService.Core.Interfaces
{
    public interface ITransactionService
    {
        Task<PaginatedResultDto<TransactionResponseDto>> GetAllTransactionsAsync(Guid userId, TransactionFilterParams filters, bool includeDetails = false);
        Task<TransactionResponseDto?> GetTransactionByIdAsync(Guid userId, Guid transactionId, bool includeDetails = false);
        Task<TransactionResponseDto> CreateTransactionAsync(Guid userId, CreateTransactionRequestDto request);
        Task<TransactionResponseDto> UpdateTransactionAsync(Guid userId, Guid transactionId, UpdateTransactionRequestDto request);
        Task<TransactionResponseDto> DeleteTransactionAsync(Guid userId, Guid transactionId);
    }
}