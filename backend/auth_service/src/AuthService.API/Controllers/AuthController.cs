using Microsoft.AspNetCore.Mvc;
using AuthService.Infrastructure.MessageBroker;
using AuthService.Core.DTOs;
using AuthService.Core.Interfaces;

namespace AuthService.API.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IRabbitMQPublisher _rabbitMQPublisher;
        private readonly IAuthService _authService;

        public AuthController(IRabbitMQPublisher rabbitMQPublisher, IAuthService authService)
        {
            this._rabbitMQPublisher = rabbitMQPublisher;
            this._authService = authService;
        }

        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            Console.WriteLine("🔥 HIT HEALTH");
            return Ok("Auth Service is healthy.");
        }

        [HttpPost("test-publish")]
        public async Task<IActionResult> TestPublish()
        {
            var testMessage = new { Text = "Hello from Auth Service!", Timestamp = DateTime.UtcNow };
            await _rabbitMQPublisher.PublishAsync(testMessage, "user.user_create");
            return Ok("Test message published to RabbitMQ.");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequest)
        {
            var result = await _authService.RegisterUserAsync(registerRequest);
            if (result.Succeeded)
            {
                return Ok("User registered successfully.");
            }
            return BadRequest(result.Errors);
        }

    }
}