namespace TransactionService.Core.Interfaces
{
    public interface IAccountInternalService
    {
        Task<bool> ValidateAccountAsync(Guid accountId, Guid userId);
    }
}