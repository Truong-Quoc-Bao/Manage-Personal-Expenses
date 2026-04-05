namespace TransactionService.Core.Interfaces
{
    public interface IAccountInternalService
    {
        Task<(bool Exists, bool HasBalance)> ValidateAccountAsync(Guid accountId, decimal amount);
    }
}