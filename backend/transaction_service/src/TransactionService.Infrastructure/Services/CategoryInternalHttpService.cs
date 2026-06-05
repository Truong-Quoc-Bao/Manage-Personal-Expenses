using System.Net.Http.Json;
using TransactionService.Core.DTOs;
using TransactionService.Core.Interfaces;

namespace TransactionService.Infrastructure.Services
{
    public class CategoryInternalHttpService : ICategoryInternalService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public CategoryInternalHttpService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<bool> ValidateCategoryAsync(Guid categoryId, Guid userId, string transactionType)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("CategoryHttp");
                var response = await client.GetAsync($"/api/categories/internal/{categoryId}/status?userId={userId}&transactionType={transactionType}");
                if (!response.IsSuccessStatusCode) return false;
                var data = await response.Content.ReadFromJsonAsync<CategoryStatusResponse>();
                return data?.Valid ?? false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Category Service (HTTP): {ex.Message}");
                return false;
            }
        }

        public async Task<CategoryDisplayDto> GetCategoryDisplayAsync(Guid categoryId, Guid userId, string transactionType)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("CategoryHttp");
                var response = await client.GetAsync($"/api/categories/internal/{categoryId}/display?userId={userId}&transactionType={transactionType}");
                if (!response.IsSuccessStatusCode) return new CategoryDisplayDto { Found = false };
                var data = await response.Content.ReadFromJsonAsync<CategoryDisplayDto>();
                return data ?? new CategoryDisplayDto { Found = false };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Category Service display (HTTP): {ex.Message}");
                return new CategoryDisplayDto { Found = false };
            }
        }

        private class CategoryStatusResponse
        {
            public bool Valid { get; set; }
        }
    }
}