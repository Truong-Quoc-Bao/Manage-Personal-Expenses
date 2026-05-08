using TransactionService.Core.DTOs;

namespace TransactionService.Core.Interfaces
{
    public interface IAccountInternalService
    {
        Task<bool> ValidateAccountAsync(Guid accountId, Guid userId);
        Task<AccountDisplayDto> GetAccountDisplayAsync(Guid accountId, Guid userId);
    }
}