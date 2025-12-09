import { ConnectionOptions } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

export const connection: ConnectionOptions = {
    // host: process.env.REDIS_HOST || 'localhost',
    // port: parseInt(process.env.REDIS_PORT || '6379'),
    // password: process.env.REDIS_PASSWORD,
    // username: process.env.REDIS_USERNAME,
    url: process.env.REDIS_URL,
    // If using Upstash or similar, you might need tls: {}
    // tls: process.env.REDIS_TLS ? {} : undefined, 
};
