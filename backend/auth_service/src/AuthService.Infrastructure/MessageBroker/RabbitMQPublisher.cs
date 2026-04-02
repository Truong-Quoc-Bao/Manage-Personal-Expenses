using AuthService.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client.Shared;
using System.Text;
using System.Text.Json;

namespace AuthService.Infrastructure.MessageBroker
{
    public class RabbitMQPublisher : IRabbitMQPublisher
    {
        private readonly IRabbitMQClient _rabbitMQClient;

        public RabbitMQPublisher(IRabbitMQClient rabbitMQClient)
        {
            _rabbitMQClient = rabbitMQClient;
        }

        public async Task PublishAsync<T>(T message, string routingKey)
        {
            await _rabbitMQClient.PublishAsync(message, routingKey);
        }
    }
}