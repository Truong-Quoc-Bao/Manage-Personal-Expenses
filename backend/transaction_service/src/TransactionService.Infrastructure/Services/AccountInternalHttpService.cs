using System.Net.Http.Json;
using TransactionService.Core.DTOs;
using TransactionService.Core.Interfaces;

namespace TransactionService.Infrastructure.Services
{
    public class AccountInternalHttpService : IAccountInternalService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public AccountInternalHttpService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> ValidateAccountAsync(Guid accountId, Guid userId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("AccountHttp");
                var response = await client.GetAsync($"/internal/{accountId}/status?userId={userId}");
                if (!response.IsSuccessStatusCode) return false;
                var data = await response.Content.ReadFromJsonAsync<AccountStatusResponse>();
                return data?.Exists ?? false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Account Service (HTTP): {ex.Message}");
                return false;
            }
        }

        public async Task<AccountDisplayDto> GetAccountDisplayAsync(Guid accountId, Guid userId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("AccountHttp");
                var response = await client.GetAsync($"/internal/{accountId}/display?userId={userId}");
                if (!response.IsSuccessStatusCode) return new AccountDisplayDto { Found = false };
                var data = await response.Content.ReadFromJsonAsync<AccountDisplayDto>();
                return data ?? new AccountDisplayDto { Found = false };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Account Service display (HTTP): {ex.Message}");
                return new AccountDisplayDto { Found = false };
            }
        }

        private class AccountStatusResponse
        {
            public bool Exists { get; set; }
        }
    }
}