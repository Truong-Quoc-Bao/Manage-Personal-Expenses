using TransactionService.Core.Interfaces;
using TransactionService.Infrastructure.Protos;

namespace TransactionService.Infrastructure.Services
{
    public class AccountInternalService : IAccountInternalService
    {
        private readonly Protos.AccountProtoService.AccountProtoServiceClient _accountClient;

        public AccountInternalService(Protos.AccountProtoService.AccountProtoServiceClient accountClient)
        {
            _accountClient = accountClient;
        }

        public async Task<(bool Exists, bool HasBalance)> ValidateAccountAsync(Guid accountId, decimal amount)
        {
            var request = new GetAccountRequest
            {
                AccountId = accountId.ToString(),
                AmountToCheck = (double)amount
            };
            try 
            {
                var response = await _accountClient.GetAccountStatusAsync(request);
                return (response.Exists, response.HasEnoughBalance);
            }
            catch (Exception ex)
            {
                return (false, false);
            }
        }
    }
}