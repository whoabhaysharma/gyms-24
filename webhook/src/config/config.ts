import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 4000,

    logLevel: process.env.LOG_LEVEL || 'info',

    whatsapp: {
        token: process.env.API_KEY,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        verifyToken: process.env.VERIFY_TOKEN,
        apiVersion: 'v24.0',
        baseUrl: 'https://graph.facebook.com',
    },

    backend: {
        url: process.env.BACKEND_URL || 'http://localhost:3000/api',
        internalSecret: process.env.INTERNAL_SECRET, // Shared secret for internal communication
        useMock: process.env.USE_MOCK_BACKEND === 'true', // Feature flag for mock backend
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
};
