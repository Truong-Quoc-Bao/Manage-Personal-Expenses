const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const amqp = require('amqp-connection-manager');

class RabbitMQClient {
    constructor() {
        this.connection = null;
        this.pubChannelWrapper = null;
        // this.channel = null;
        this.url = process.env.RABBITMQ_URL;
        this.exchange = process.env.RABBITMQ_EXCHANGE;
        this.retryAttempts = parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS);
        this.retryDelay = parseInt(process.env.RABBITMQ_RETRY_DELAY);
    }

    async connect() {
        if (this.connection) return;

        this.connection = amqp.connect([this.url]);

        this.connection.on('connect', () => console.log('[RabbitMQ] Connected!'));
        this.connection.on('disconnect', (err) => console.error('[RabbitMQ] Disconnected:', err.err.message))

        this.pubChannelWrapper = this.connection.createChannel({
            json: true,
            setup: async (channel) => {
                for (const ex of this.exchanges) {
                    await channel.assertExchange(ex, 'topic', { durable: true });
                    console.log(`[RabbitMQ] Exchange "${this.exchange}" is ready`);
                }
            }
        })

        await this.pubChannelWrapper.waitForConnect();
    }

    async publish(routingKey, message) {
        await this.connect();

        try {
            const exchangeName = routingKey.split('.')[0] + '.events';
            await this.pubChannelWrapper.publish(exchangeName, routingKey, message);
            console.log(`[RabbitMQ] Published message to "${routingKey}":`, message);
        } catch (err) {
            console.error(`[RabbitMQ] Publish error:`, err);
            throw err;
        }
    }

    async consume(queueName, routingKeys, callback) {
        const keys = Array.isArray(routingKeys) ? routingKeys : [routingKeys];
        

        const consumerChannel = this.connection.createChannel({
            setup: async (channel) => {
                
                await channel.assertQueue(queueName, { durable: true });
                
                for (const key of keys) {
                    let exchangeName = key.split('.')[0] + '.events';
                    await channel.assertExchange(exchangeName, 'topic', { durable: true });
                    await channel.bindQueue(queueName, exchangeName, key);

                    console.log(`[*] Bound: ${exchangeName} -> ${key} -> ${queueName}`);
                }

                await channel.consume(queueName, async (msg) => {
                    if (!msg) return;
                    try {
                        const content = JSON.parse(msg.content.toString());
                        await callback(content, msg);
                        channel.ack(msg);
                    } catch (err) {
                        console.error(`[Consumer Error] ${queueName}:`, err.message);
                        channel.nack(msg, false, false);
                    }
                });
            }
        });

        await consumerChannel.waitForConnect();
        console.log(`[RabbitMQ] Consumer ready for queue: ${queueName}`);
    }
}

module.exports = new RabbitMQClient();