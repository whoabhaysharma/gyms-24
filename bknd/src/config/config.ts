import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,

    appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    internalSecret: process.env.INTERNAL_SECRET,

    database: {
        url: process.env.DATABASE_URL,
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },

    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET,
    },

    admin: {
        phoneNumber: process.env.ADMIN_PHONE_NUMBER,
    },

    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'ap-south-1',
        bucketName: process.env.AWS_BUCKET_NAME || '',
    },
};
