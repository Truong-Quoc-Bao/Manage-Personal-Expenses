using System.Threading.Tasks;

namespace RabbitMQ.Client.Shared
{
    public interface IRabbitMQClient
    {
        Task PublishAsync<T>(T message, string routingKey);

        Task ConsumeAsync<T>(string queueName, string[] routingKeys, Func<T, Task> onMessageReceived);
    }
}