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

        public async Task<bool> ValidateAccountAsync(Guid accountId, Guid userId)
        {
            var request = new GetAccountRequest
            {
                AccountId = accountId.ToString(),
                UserId = userId.ToString()
            };
            try 
            {
                var response = await _accountClient.GetAccountStatusAsync(request);
                Console.WriteLine($"Account Service response: Message={response.Message}, Exists={response.Exists}");
                return response.Exists;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Account Service: {ex.Message}");
                return false;
            }
        }
    }
}