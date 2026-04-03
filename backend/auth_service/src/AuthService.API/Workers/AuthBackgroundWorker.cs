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
            await _rabbitMQClient.ConsumeAsync<UserRegistrationConsumeEvent>("user.user_create.queue", new[] { "user.user_created_status" }, async (message) =>
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    switch (message.Status)
                    {
                        case "Success":
                            var _authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
                            await _authService.UpdateStatusUserAsync(message);
                            break;
                        case "Fail":
                            await _authService.UpdateStatusUserAsync(message);
                            break;
                    }
                }
            });

            await _rabbitMQClient.ConsumeAsync<UserRegistrationFailedEvent>("user.user_create.queue", new[] { "user.user_create_fail" }, async (message) =>
            {
                var userRejected = new UserRegistrationFailedEvent
                {
                    UserId = message.UserId,
                };

                using (var scope = _serviceProvider.CreateScope())
                {
                    var _authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
                    await _authService.UpdateStatusUserAsync(userRejected);
                }
            });
        }
    }
}