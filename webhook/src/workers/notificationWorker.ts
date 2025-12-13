import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import * as WhatsAppService from '../services/whatsapp';
import { logWithContext } from '../utils/logger';
import axios from 'axios';

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

    try {
        // 1. Download the PDF from the public URL
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(response.data);

        // 2. Upload to WhatsApp to get a Media ID
        // Note: WhatsApp API requires a mime type. We assume application/pdf for invoices.
        const mediaId = await WhatsAppService.uploadMedia(fileBuffer, filename || 'invoice.pdf', 'application/pdf');

        // 3. Send Document Message using Media ID
        await WhatsAppService.sendDocument(cleanMobile, mediaId, filename, caption || 'Here is your invoice for the recent purchase. Thank you for choosing Gyms24!');

    } catch (error: any) {
        console.error('Error handling invoice send:', error.message);
        // Fallback: Try sending as a link if upload fails
        await WhatsAppService.sendDocument(cleanMobile, pdfUrl, filename, caption || 'Here is your invoice for the recent purchase. Thank you for choosing Gyms24!');
    }
};
