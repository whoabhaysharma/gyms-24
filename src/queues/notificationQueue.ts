import { Queue } from 'bullmq';
import { connection } from './connection';

export const NOTIFICATION_QUEUE_NAME = 'notification-queue';

export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
    connection,
});
