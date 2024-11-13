import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

redis.on('connect', () => {
  console.log('Conectado a Redis');
});

redis.on('error', (err) => {
  console.error('Error en Redis:', err);
});

export default redis;
