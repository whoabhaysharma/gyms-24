import { Job } from 'bullmq';
import { QueueJobData } from '../types';
import { handleIncomingMessage } from '../handlers/messageHandler';
import { logWithContext } from '../utils/logger';

export const processJob = async (job: Job<QueueJobData>) => {
    const { type, payload } = job.data;
    logWithContext('Processor', `Processing job: ${job.id}`, { type });

    if (type === 'incoming_message') {
        const entry = payload.entry[0];
        const changes = entry.changes[0];
        const value = changes.value;

        if (value.messages && value.messages.length > 0) {
            const message = value.messages[0];
            const contacts = value.contacts;

            await handleIncomingMessage(message, contacts);
        }
    }
};
