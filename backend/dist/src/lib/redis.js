import Redis from 'ioredis';
const REDIS_URL = "rediss://default:AZdoAAIncDE1ZDUzMzY5ZmZiYzA0NThmODY4MGU0YzA4OGJhNTM3N3AxMzg3NjA@lenient-tadpole-38760.upstash.io:6379";
const redisUrl = process.env.REDIS_URL || REDIS_URL;
if (!redisUrl) {
    console.warn('⚠️ REDIS_URL não encontrada no .env! Tentando localhost...');
}
const redis = new Redis(redisUrl || 'redis://localhost:6379');
redis.on('connect', () => console.log('✅ Conectado ao Redis do Zaeon'));
redis.on('error', (err) => console.error('❌ Erro no Redis:', err));
export default redis;
