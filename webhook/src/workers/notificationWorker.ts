import { Worker, Job } from 'bullmq';
import { connection } from '../queues/connection';
import * as WhatsAppService from '../services/whatsapp';
import * as InvoiceService from '../services/invoice';
import * as StorageService from '../services/storage';
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

const handleSendInvoice = async (payload: any) => {
    const { mobile, invoiceNumber, date, userName, gymName, planName, startDate, expiryDate, accessCode, amount } = payload;

    if (!mobile) {
        throw new Error('Missing mobile in payload');
    }

    const cleanMobile = mobile.replace(/\D/g, '');

    // 1. Generate PDF
    const pdfBuffer = await InvoiceService.generateInvoicePdf({
        invoiceNumber,
        date,
        userName,
        userMobile: cleanMobile,
        gymName,
        planName,
        startDate,
        expiryDate,
        accessCode,
        amount
    });

    // 2. Upload PDF to S3
    const filename = `Invoice_${invoiceNumber}.pdf`;
    const s3Url = await StorageService.uploadToS3(pdfBuffer, filename, 'application/pdf');

    // 3. Send Document Message using S3 URL
    await WhatsAppService.sendDocument(cleanMobile, s3Url, filename, 'Here is your invoice for the recent subscription.');
};
