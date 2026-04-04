using RabbitMQ.Client.Shared;

namespace TransactionService.API.Workers
{
    public class TransactionBackgroundWorker : BackgroundService
    {
        private readonly IRabbitMQClient _rabbitMQClient;

        public TransactionBackgroundWorker(IRabbitMQClient rabbitMQClient)
        {
            _rabbitMQClient = rabbitMQClient;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _rabbitMQClient.ConsumeAsync<object>("transaction.transaction_create.queue", new[] {"transaction.transaction_create"}, async (message) =>
            {
                Console.WriteLine($"Received message: {message}");
                await Task.CompletedTask;
            });
        }
    }
}