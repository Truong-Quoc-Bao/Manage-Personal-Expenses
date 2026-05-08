using RabbitMQ.Client.Shared;
using AuthService.Application.Services;
using AuthService.Core.Interfaces;
using AuthService.Core.DTOs;

namespace AuthService.API.Workers
{
    public class AuthBackgroundWorker : BackgroundService
    {
        private readonly IRabbitMQClient _rabbitMQClient;
        private readonly IServiceProvider _serviceProvider;

        public AuthBackgroundWorker(IRabbitMQClient rabbitMQClient, IServiceProvider serviceProvider)
        {
            _rabbitMQClient = rabbitMQClient;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Một queue + một consumer: tránh hai BasicConsume trên cùng queue (round-robin, handler sai).
            await _rabbitMQClient.ConsumeAsync<UserRegistrationConsumeEvent>(
                "user.user_create.queue",
                new[] { "user.user_created_status", "user.user_create_fail" },
                async (message) =>
            {
                using var scope = _serviceProvider.CreateScope();
                var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

                // user.user_create_fail: có thể chỉ có UserId — coi là Fail (Rejected).
                var consumeEvent = string.IsNullOrEmpty(message.Status) && !string.IsNullOrEmpty(message.UserId)
                    ? new UserRegistrationConsumeEvent
                    {
                        UserId = message.UserId,
                        Email = message.Email,
                        Reason = message.Reason,
                        Status = "Fail",
                    }
                    : message;

                if (consumeEvent.Status is "Success" or "Fail")
                {
                    await authService.UpdateStatusUserAsync(consumeEvent);
                }
            });
        }
    }
}