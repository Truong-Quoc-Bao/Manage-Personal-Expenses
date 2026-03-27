using Microsoft.AspNetCore.Mvc;
// using AuthService.API.Services;

namespace AuthService.API.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {

        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            Console.WriteLine("🔥 HIT HEALTH");
            return Ok("Auth Service is healthy.");
        }

        [HttpGet("health2")]
        public IActionResult HealthCheck2()
        {
            Console.WriteLine("🔥 HIT HEALTH2");
            return Ok("Auth Service is healthy2.");
        }

        [HttpGet("health3")]
        public IActionResult HealthCheck3()
        {
            Console.WriteLine("🔥 HIT HEALTH3");
            return Ok("Auth Service is healthy3.");
        }

        [HttpGet("health4")]
        public IActionResult HealthCheck4()
        {
            Console.WriteLine("🔥 HIT HEALTH4");
            return Ok("Auth Service is healthy4.");
        }

        [HttpGet("health5")]
        public IActionResult HealthCheck5()
        {
            Console.WriteLine("🔥 HIT HEALTH5");
            return Ok("Auth Service is healthy5.");
        }

        [HttpGet("health6")]
        public IActionResult HealthCheck6()
        {
            Console.WriteLine("🔥 HIT HEALTH6");
            return Ok("Auth Service is healthy6.");
        }
    }
}