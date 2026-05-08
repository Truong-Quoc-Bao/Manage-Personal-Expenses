using Microsoft.AspNetCore.Mvc;
using TransactionService.Core.Interfaces;
using TransactionService.Core.DTOs;
using TransactionService.API.Filters;

namespace TransactionService.API.Controllers
{
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        public TransactionsController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        private Guid GetUserId()
        {
            var userIdHeader = Request.Headers["X-User-Id"].FirstOrDefault();
            if (string.IsNullOrEmpty(userIdHeader) || !Guid.TryParse(userIdHeader, out var userId))
            {
                throw new UnauthorizedAccessException("User ID not found in request headers");
            }
            return userId;
        }

        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok("Transaction Service is healthy.");
        }

        [HttpGet("/")]
        public async Task<IActionResult> GetAllTransactions(
            [FromQuery(Name = "category_id")] Guid? categoryId,
            [FromQuery(Name = "account_id")] Guid? accountId,
            [FromQuery(Name = "transaction_type")] string? transactionType,
            [FromQuery(Name = "date_from")] DateTime? dateFrom,
            [FromQuery(Name = "date_to")] DateTime? dateTo,
            [FromQuery(Name = "page")] int page = 1,
            [FromQuery(Name = "page_size")] int pageSize = 10,
            [FromQuery(Name = "include_details")] bool includeDetails = false)
        {
            var userId = GetUserId();

            var filters = new TransactionFilterParams
            {
                Page = page,
                PageSize = pageSize,
                CategoryId = categoryId,
                AccountId = accountId,
                TransactionType = transactionType,
                DateFrom = dateFrom,
                DateTo = dateTo
            };

            var result = await _transactionService.GetAllTransactionsAsync(userId, filters, includeDetails);
            return Ok(result);
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetTransactionById(
            [FromRoute] Guid id,
            [FromQuery(Name = "include_details")] bool includeDetails = false)
        {
            var userId = GetUserId();
            var transaction = await _transactionService.GetTransactionByIdAsync(userId, id, includeDetails);

            if (transaction == null)
            {
                return NotFound();
            }
            return Ok(transaction);
        }

        [HttpPost("/")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionRequestDto request)
        {
            var userId = GetUserId();
            var createdTransaction = await _transactionService.CreateTransactionAsync(userId, request);
            return CreatedAtAction(nameof(GetTransactionById), new { id = createdTransaction.TransId }, createdTransaction);
        }

        [HttpPut]
        [Route("{id:Guid}")]
        [ServiceFilter(typeof(ValidationFilter))]
        public async Task<IActionResult> UpdateTransaction([FromRoute] Guid id, [FromBody] UpdateTransactionRequestDto request)
        {
            var userId = GetUserId();
            var updatedTransaction = await _transactionService.UpdateTransactionAsync(userId, id, request);
            return Ok(updatedTransaction);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteTransaction([FromRoute] Guid id)
        {
            var userId = GetUserId();
            var deletedTransaction = await _transactionService.DeleteTransactionAsync(userId, id);
            return Ok(deletedTransaction);
        }
    }
}
