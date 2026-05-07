using TransactionService.Core.Entities;
using TransactionService.Core.Interfaces;
using TransactionService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace TransactionService.Infrastructure.Repositories
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly TransactionDbContext _context;

        public TransactionRepository(TransactionDbContext context)
        {
            _context = context;
        }

        public async Task<List<Transaction>> GetAllTransactionsAsync(Guid userId, Guid? categoryId = null)
        {
            var query = _context.Transactions.Where(t => t.UserId == userId);
            if (categoryId.HasValue)
            {
                query = query.Where(t => t.CategoryId == categoryId.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<Transaction?> GetTransactionByIdAsync(Guid userId, Guid transactionId)
        {
            return await _context.Transactions.FirstOrDefaultAsync(t => t.UserId == userId && t.TransId == transactionId);
        }

        public async Task<Transaction> CreateTransactionAsync(Transaction transaction)
        {
            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task<Transaction?> UpdateTransactionAsync(Guid userId, Guid transactionId, Transaction updatedTransaction)
        {
            var existingTransaction = await _context.Transactions.FirstOrDefaultAsync(t => t.UserId == userId && t.TransId == transactionId);
            if (existingTransaction == null){
                return null;
            }

            _context.Entry(existingTransaction).CurrentValues.SetValues(updatedTransaction);

            await _context.SaveChangesAsync();
            return existingTransaction;
        }

        public async Task<Transaction> DeleteTransactionAsync(Guid userId, Guid transactionId)
        {
            var existingTransaction = await _context.Transactions.FirstOrDefaultAsync(t => t.UserId == userId && t.TransId == transactionId);
            if (existingTransaction == null){
                throw new Exception("Transaction not found");
            }

            _context.Transactions.Remove(existingTransaction);
            await _context.SaveChangesAsync();
            return existingTransaction;
        }
    }
}