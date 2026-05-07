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

        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok("Transaction Service is healthy.");
        }

        [HttpGet("/")]
        public async Task<IActionResult> GetAllTransactions()
        {
            var userId = Guid.Parse("4f4b144d-e3f8-4e6b-9e32-408030a85698");
            var transactions = await _transactionService.GetAllTransactionsAsync(userId);
            return Ok(transactions);
        }

        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetTransactionById([FromRoute] Guid id)
        {
            var userId = Guid.Parse("4f4b144d-e3f8-4e6b-9e32-408030a85698");
            var transaction = await _transactionService.GetTransactionByIdAsync(userId, id);

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
            var userId = Guid.Parse("4f4b144d-e3f8-4e6b-9e32-408030a85698");
            var createdTransaction = await _transactionService.CreateTransactionAsync(userId, request);
            return CreatedAtAction(nameof(GetTransactionById), new { id = createdTransaction.TransId }, createdTransaction);
        }

        [HttpDelete]
        [Route("{id:Guid}")]
        public async Task<IActionResult> DeleteTransaction([FromRoute] Guid id)
        {
            var userId = Guid.Parse("4f4b144d-e3f8-4e6b-9e32-408030a85698");
            var deletedTransaction = await _transactionService.DeleteTransactionByIdAsync(userId, id);
            return Ok(deletedTransaction);
        }
    }
}