using Microsoft.AspNetCore.Mvc;

namespace TransactionService.API.Controllers
{
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok("Transaction Service is healthy.");
        }
    }
}