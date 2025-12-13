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
                } else if (type === 'WHATSAPP_INVOICE') {
                    await handleSendInvoice(payload);
                } else {
                    logWithContext('NotificationWorker', `Unknown job type: ${type}`, {}, 'warn');
                }
            }
        } catch (error: any) {
            logWithContext('NotificationWorker', 'Job failed', {
                jobName: job.name,
                error: error.message,
                stack: error.stack
            }, 'error');
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

    const cleanMobile = mobile.replace(/\D/g, '');

    const message = `*Membership Active!* 🏋️‍♂️\n\n📍 *${gymName}*\n📋 ${planName}\n📅 Valid: ${new Date(endDate).toLocaleDateString()}\n\n🔑 *Code: ${accessCode}*\n(Show at reception)\n\n📄 _Invoice will be sent shortly._`;

    await WhatsAppService.sendMessage(cleanMobile, message);
};

const handleSendInvoice = async (payload: any) => {
    const { mobile, pdfUrl, filename, caption } = payload;

    if (!mobile || !pdfUrl) {
        throw new Error('Missing mobile or pdfUrl in payload');
    }

    const cleanMobile = mobile.replace(/\D/g, '');

    // Send Document Message using S3 URL
    await WhatsAppService.sendDocument(cleanMobile, pdfUrl, filename, caption || 'Here is your invoice for the recent purchase. Thank you for choosing Gyms24!');
};
