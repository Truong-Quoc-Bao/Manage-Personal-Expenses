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
    }
}