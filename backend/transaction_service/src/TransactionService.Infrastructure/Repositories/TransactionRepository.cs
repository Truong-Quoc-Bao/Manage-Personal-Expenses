using TransactionService.Core.DTOs;
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

        public async Task<(List<Transaction> Items, int TotalCount)> GetAllTransactionsAsync(Guid userId, TransactionFilterParams filters)
        {
            var query = _context.Transactions.Where(t => t.UserId == userId);

            if (filters.CategoryId.HasValue)
                query = query.Where(t => t.CategoryId == filters.CategoryId.Value);

            if (filters.AccountId.HasValue)
                query = query.Where(t => t.AccountId == filters.AccountId.Value);

            if (!string.IsNullOrEmpty(filters.TransactionType)
                && Enum.TryParse<TransactionType>(filters.TransactionType, true, out var txType))
                query = query.Where(t => t.TransactionType == txType);

            if (filters.DateFrom.HasValue)
                query = query.Where(t => t.Date >= filters.DateFrom.Value);

            if (filters.DateTo.HasValue)
                query = query.Where(t => t.Date <= filters.DateTo.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .Skip((filters.Page - 1) * filters.PageSize)
                .Take(filters.PageSize)
                .ToListAsync();

            return (items, totalCount);
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

            existingTransaction.AccountId = updatedTransaction.AccountId;
            existingTransaction.CategoryId = updatedTransaction.CategoryId;
            existingTransaction.Amount = updatedTransaction.Amount;
            existingTransaction.TransactionType = updatedTransaction.TransactionType;
            existingTransaction.Description = updatedTransaction.Description;
            existingTransaction.Date = updatedTransaction.Date;
            existingTransaction.Note = updatedTransaction.Note;
            existingTransaction.UpdatedAt = DateTime.UtcNow;

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