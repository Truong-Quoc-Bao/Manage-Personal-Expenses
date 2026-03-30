using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace RabbitMQ.Client.Shared
{
    public class RabbitMQClient : IRabbitMQClient, IDisposable
    {
        private readonly string _connectionString;
        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMQClient(string connectionString)
        {
            _connectionString = connectionString;
        }

        private async Task EnsureConnectionAsync()
        {
            if (_connection != null || _connection.IsOpen) return;
        
            var factory = new ConnectionFactory() { Uri = new Uri(_connectionString) };
            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();
        }

        public async Task PublishAsync<T>(T message, string routingKey)
        {
            await EnsureConnectionAsync();

            string exchangeName = routingKey.Split('.')[0] + ".events";
            await _channel!.ExchangeDeclareAsync(exchangeName, ExchangeType.Topic, durable: true);

            var json = JsonSerializer.Serialize(message, new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
            });
            var body = Encoding.UTF8.GetBytes(json);

            var properties = new BasicProperties { Persistent = true };

            await _channel.BasicPublishAsync(
                exchange: exchangeName, 
                routingKey: routingKey, 
                mandatory: true,
                basicProperties: properties, 
                body: body
            );
            Console.WriteLine($"[RabbitMQ] Sent to {exchangeName} via {routingKey}");
        }

        public async Task ConsumeAsync<T>(string queueName, string[] routingKeys, Func<T, Task> onMessageReceived)
        {
            await EnsureConnectionAsync();

            await _channel.QueueDeclareAsync(queueName, durable: true, exclusive: false, autoDelete: false);

            foreach (var key in routingKeys)
            {
                string exchangeName = key.Split('.')[0] + ".events";
                await _channel.ExchangeDeclareAsync(exchangeName, ExchangeType.Topic, durable: true);
                await _channel.QueueBindAsync(queueName, exchangeName, key);
            }

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var messageJson = Encoding.UTF8.GetString(body);

                try
                {
                    var message = JsonSerializer.Deserialize<T>(messageJson, new JsonSerializerOptions 
                    { 
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
                    });
                    if (message != null)
                    {
                        await onMessageReceived(message);
                    }
                    await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[RabbitMQ Error] Consume: {ex.Message}");
                    await _channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
                }
            };

            await _channel.BasicConsumeAsync(queue: queueName, autoAck: false, consumer: consumer);
            Console.WriteLine($"[RabbitMQ] Consuming from {queueName} with routing keys: {string.Join(", ", routingKeys)}");
        }

        public void Dispose()
        {
            _channel?.Dispose();
            _connection?.Dispose();
        }
    }
}