namespace TransactionService.Core.Interfaces
{
    public interface IRabbitMQPublisher
    {
        Task PublishAsync<T>(T message, string routingKey);
    }
}