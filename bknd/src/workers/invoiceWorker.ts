import { Worker } from 'bullmq';
import { redisConnectionConfig } from '../lib/redis';
import { InvoiceQueue, NotificationQueue } from '@queues';
import { generateInvoicePdf, generateQRCodeImage } from '../services/invoice.service';
import { uploadToS3 } from '../services/storage.service';
import IORedis from 'ioredis';
import logger from '../lib/logger';

const connection = new IORedis(redisConnectionConfig.url, redisConnectionConfig.options);

export const invoiceWorker = new Worker(
    InvoiceQueue.QUEUE_NAME,
    async (job) => {
        logger.info(`[InvoiceWorker] Processing job ${job.id}`);
        const { subscriptionId, invoiceData, shouldSendWhatsapp, whatsappPayload } = job.data;

        try {
            // 1. Generate PDF
            const pdfBuffer = await generateInvoicePdf(invoiceData);

            // 2. Upload Invoice to S3
            const invoiceFilename = `subscriptions/${subscriptionId}/invoice.pdf`;
            await uploadToS3(pdfBuffer, invoiceFilename, 'application/pdf');
            logger.info(`[InvoiceWorker] Invoice uploaded: ${invoiceFilename}`);

            // 3. Generate QR Code Image
            const qrCodeBuffer = await generateQRCodeImage(invoiceData.accessCode);

            // 4. Upload QR Code to S3
            const qrFilename = `subscriptions/${subscriptionId}/QR.png`;
            const qrCodeUrl = await uploadToS3(qrCodeBuffer, qrFilename, 'image/png');
            logger.info(`[InvoiceWorker] QR Code uploaded: ${qrFilename}`);

            // 5. Queue WhatsApp Notification (if requested)
            if (shouldSendWhatsapp && whatsappPayload) {
                // Construct the full payload
                const fullPayload = {
                    ...whatsappPayload,
                    imageUrl: qrCodeUrl,
                    filename: qrFilename
                };

                await NotificationQueue.add('send-whatsapp', {
                    type: 'WHATSAPP_QR_CODE_IMAGE',
                    payload: fullPayload
                });
                logger.info(`[InvoiceWorker] WhatsApp notification queued for ${whatsappPayload.mobile}`);
            }

        } catch (error: any) {
            logger.error(`[InvoiceWorker] Job ${job.id} failed:`, error);
            throw error;
        }
    },
    {
        connection,
        concurrency: 5,
    }
);

invoiceWorker.on('completed', (job) => {
    logger.info(`[InvoiceWorker] Job ${job.id} completed!`);
});

invoiceWorker.on('failed', (job, err) => {
    if (job) {
        logger.error(`[InvoiceWorker] Job ${job.id} failed with ${err.message}`);
    } else {
        logger.error(`[InvoiceWorker] Job failed with ${err.message}`);
    }
});
