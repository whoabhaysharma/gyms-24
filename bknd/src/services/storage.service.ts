import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/config';
import logger from '../lib/logger';

const s3Client = new S3Client({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
    },
});

export const uploadToS3 = async (
    fileBuffer: Buffer,
    filename: string,
    contentType: string
): Promise<string> => {
    try {
        logger.info(`[StorageService] Uploading file to S3: ${filename}`);

        const command = new PutObjectCommand({
            Bucket: config.aws.bucketName,
            Key: filename,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // Construct the URL
        const url = `https://${config.aws.bucketName}.s3.${config.aws.region}.amazonaws.com/${filename}`;

        logger.info(`[StorageService] File uploaded successfully to S3`, { url });
        return url;
    } catch (error: any) {
        logger.error('[StorageService] Error uploading to S3', { error: error.message });
        throw error;
    }
};
