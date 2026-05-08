using TransactionService.Core.DTOs;
using TransactionService.Core.Entities;

namespace TransactionService.Core.Interfaces
{
    public interface ITransactionRepository
    {
        Task<(List<Transaction> Items, int TotalCount)> GetAllTransactionsAsync(Guid userId, TransactionFilterParams filters);
        Task<Transaction?> GetTransactionByIdAsync(Guid userId, Guid transactionId);
        Task<Transaction> CreateTransactionAsync(Transaction transaction);
        Task<Transaction?> UpdateTransactionAsync(Guid userId, Guid transactionId, Transaction updatedTransaction);
        Task<Transaction> DeleteTransactionAsync(Guid userId, Guid transactionId);
    }
}