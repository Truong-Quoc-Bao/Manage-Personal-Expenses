using TransactionService.Core.DTOs;

namespace TransactionService.Core.Interfaces
{
    public interface ITransactionService
    {
        Task<List<TransactionResponseDto>> GetAllTransactionsAsync(Guid userId);
        Task<TransactionResponseDto> GetTransactionByIdAsync(Guid userId, Guid transactionId);
        Task<TransactionResponseDto> CreateTransactionAsync(Guid userId, CreateTransactionRequestDto request);
        Task<TransactionResponseDto> UpdateTransactionAsync(Guid userId, Guid transactionId, UpdateTransactionRequestDto request);
        Task <TransactionResponseDto> DeleteTransactionAsync(Guid userId, Guid transactionId);
    }
}