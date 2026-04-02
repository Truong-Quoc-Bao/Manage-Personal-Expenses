using TransactionService.Core.Interfaces;
using RabbitMQ.Client.Shared;
using Micorosoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;

namespace TransactionService.Infrastructure.MessageBroker
{
    public class RabbitMQPublisher : IRabbitMQPublisher
    {
        private readonly IRabbitMQClient _rabbitMQClient;

        public RabbitMQPublisher(IRabbitMQClient rabbitMQClient)
        {
            _rabbitMQClient = rabbitMQClient;
        }

        public void Publish<T>(T message, string routingKey)
        {
            await _rabbitMQClient.PublishAsync(message, routingKey);
        }
    }
}