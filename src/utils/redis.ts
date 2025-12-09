import Redis from 'ioredis';
import { config } from '../config/config';
import { logWithContext } from './logger';

const redis = new Redis(config.redis.url);

redis.on('connect', () => {
    logWithContext('Redis', 'Connected to Redis');
});

redis.on('error', (err) => {
    logWithContext('Redis', `Redis error: ${err.message}`, {}, 'error');
});

export default redis;
