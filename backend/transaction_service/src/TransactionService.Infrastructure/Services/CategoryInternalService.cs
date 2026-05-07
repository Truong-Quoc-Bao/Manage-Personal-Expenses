using TransactionService.Core.DTOs;
using TransactionService.Core.Interfaces;
using TransactionService.Infrastructure.Protos;

namespace TransactionService.Infrastructure.Services
{
    public class CategoryInternalService : ICategoryInternalService
    {
        private readonly Protos.CategoryProtoService.CategoryProtoServiceClient _categoryClient;

        public CategoryInternalService(Protos.CategoryProtoService.CategoryProtoServiceClient categoryClient)
        {
            _categoryClient = categoryClient;
        }

        public async Task<bool> ValidateCategoryAsync(Guid categoryId, Guid userId, String transactionType)
        {
            var request = new GetCategoryRequest
            {
                CategoryId = categoryId.ToString(),
                UserId = userId.ToString(),
                TransactionType = transactionType
            };
            try 
            {
                var response = await _categoryClient.GetCategoryStatusAsync(request);
                Console.WriteLine($"Category Service response: Message={response.Message}, Valid={response.Valid}");
                return response.Valid;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Category Service: {ex.Message}");
                return false;
            }
        }

        public async Task<CategoryDisplayDto> GetCategoryDisplayAsync(Guid categoryId, Guid userId, string transactionType)
        {
            var request = new GetCategoryRequest
            {
                CategoryId = categoryId.ToString(),
                UserId = userId.ToString(),
                TransactionType = transactionType
            };
            try
            {
                var response = await _categoryClient.GetCategoryDisplayAsync(request);
                return new CategoryDisplayDto
                {
                    Found = response.Found,
                    CategoryName = string.IsNullOrEmpty(response.CategoryName) ? null : response.CategoryName,
                    Color = string.IsNullOrEmpty(response.Color) ? null : response.Color,
                    IconCode = string.IsNullOrEmpty(response.IconCode) ? null : response.IconCode
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Category Service (display): {ex.Message}");
                return new CategoryDisplayDto { Found = false };
            }
        }
    }
}