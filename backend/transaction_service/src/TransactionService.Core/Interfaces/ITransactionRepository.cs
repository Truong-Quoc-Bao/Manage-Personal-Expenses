using TransactionService.Core.Entities;

namespace TransactionService.Core.Interfaces
{
    public interface ITransactionRepository
    {
        // Task CreateTransactionAsync(Transaction transaction);
        Task<List<Transaction>> GetAllTransactionsAsync(Guid userId);
        Task<Transaction?> GetTransactionByIdAsync(Guid userId, Guid transactionId);
        Task<Transaction> CreateTransactionAsync(Transaction transaction);
        Task<Transaction?> UpdateTransactionAsync(Guid userId, Guid transactionId, Transaction updatedTransaction);

        Task<Transaction> DeleteTransactionAsync(Guid userId, Guid transactionId);
        // Task DeleteTransactionAsync(Guid transactionId);
    }
}