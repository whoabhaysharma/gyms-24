import { Worker } from 'bullmq';
import { connection } from '../queues/connection';
import { QUEUE_NAME } from '../queues/messageQueue';
import { processJob } from './processor';
import { startNotificationWorker } from './notificationWorker';
import dotenv from 'dotenv';

dotenv.config();

console.log('Starting worker...');

const worker = new Worker(QUEUE_NAME, processJob, {
    connection,
    concurrency: 5, // Adjust based on load
});

// Start the notification worker
const notificationWorker = startNotificationWorker();

worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully!`);
});

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing worker');
    await worker.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing worker');
    await worker.close();
    process.exit(0);
});
