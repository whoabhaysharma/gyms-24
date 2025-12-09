import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import * as WhatsAppService from '../services/whatsapp';
import { logWithContext } from '../utils/logger';

const NOTIFICATION_QUEUE_NAME = 'notification-queue';

export const startNotificationWorker = () => {
    console.log('Starting Notification Worker...');

    const worker = new Worker(NOTIFICATION_QUEUE_NAME, async (job: Job) => {
        logWithContext('NotificationWorker', `Processing job: ${job.name}`, { data: job.data });

        try {
            if (job.name === 'send-whatsapp') {
                const { type, payload } = job.data;

                if (type === 'WHATSAPP_ACCESS_CODE') {
                    await handleSendAccessCode(payload);
                } else {
                    logWithContext('NotificationWorker', `Unknown job type: ${type}`, {}, 'warn');
                }
            }
        } catch (error: any) {
            logWithContext('NotificationWorker', 'Job failed', { error: error.message }, 'error');
            throw error;
        }

    }, {
        connection,
        concurrency: 5,
    });

    worker.on('completed', (job) => {
        console.log(`[NotificationWorker] Job ${job.id} completed!`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[NotificationWorker] Job ${job?.id} failed: ${err.message}`);
    });

    return worker;
};

const handleSendAccessCode = async (payload: any) => {
    const { mobile, accessCode, gymName, planName, endDate } = payload;

    if (!mobile || !accessCode) {
        throw new Error('Missing mobile or accessCode in payload');
    }

    // Format mobile number (ensure no + or spaces, add country code if needed)
    // Assuming payload comes with clean number or we trust the backend
    // But for safety, let's strip non-digits
    const cleanMobile = mobile.replace(/\D/g, '');

    const message = `Payment Successful! 🎉\n\nYour membership is now active.\n\n🏋️ *${gymName}*\n📦 ${planName}\n📅 Expires: ${new Date(endDate).toLocaleDateString()}\n\n🔑 *Access Code: ${accessCode}*\n\nShow this code at the gym reception to enter.`;

    await WhatsAppService.sendMessage(cleanMobile, message);
};
