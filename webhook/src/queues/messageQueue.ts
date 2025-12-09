import { Queue } from 'bullmq';
import { connection } from './connection';
import { QueueJobData } from '../types';

export const QUEUE_NAME = 'whatsapp-messages';

export const messageQueue = new Queue<QueueJobData>(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const addMessageToQueue = async (data: QueueJobData['payload']) => {
    console.log(`[MessageQueue] Adding message to queue. Type: incoming_message`);
    await messageQueue.add('incoming_message', {
        type: 'incoming_message',
        payload: data,
    });
};
