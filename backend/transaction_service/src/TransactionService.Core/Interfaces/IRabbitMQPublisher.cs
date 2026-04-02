namespace TransactionService.Core.Interfaces
{
    public interface IRabbitMQPublisher
    {
        void Publish<T>(T message, string routingKey);
    }
}