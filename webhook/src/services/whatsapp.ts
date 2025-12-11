import axios from 'axios';
import FormData from 'form-data';
import { config } from '../config/config';
import { logWithContext } from '../utils/logger';

const client = axios.create({
    baseURL: `${config.whatsapp.baseUrl}/${config.whatsapp.apiVersion}/${config.whatsapp.phoneNumberId}`,
    headers: {
        Authorization: `Bearer ${config.whatsapp.token}`,
        'Content-Type': 'application/json',
    },
});

export const sendMessage = async (to: string, content: string | any) => {
    try {
        logWithContext('WhatsAppService', `Sending message to: ${to}`, { content });
        const payload: any = {
            messaging_product: 'whatsapp',
            to,
        };

        if (typeof content === 'string') {
            payload.type = 'text';
            payload.text = { body: content };
        } else {
            Object.assign(payload, content);
        }

        const response = await client.post('/messages', payload);
        logWithContext('WhatsAppService', `Message sent successfully`, { messageId: response.data.messages?.[0]?.id });
        return response.data;
    } catch (error: any) {
        logWithContext('WhatsAppService', 'Error sending WhatsApp message', { error: error.response?.data || error.message }, 'error');
        throw error;
    }
};

export const markAsRead = async (messageId: string) => {
    try {
        logWithContext('WhatsAppService', `Marking message as read: ${messageId}`);
        await client.post('/messages', {
            messaging_product: 'whatsapp',
            status: 'read',
            message_id: messageId,
        });
        logWithContext('WhatsAppService', `Message marked as read`);
    } catch (error: any) {
        logWithContext('WhatsAppService', 'Error marking message as read', { error: error.response?.data || error.message }, 'warn');
    }
};

export const sendInteractiveButtons = async (to: string, bodyText: string, buttons: { id: string; title: string }[]) => {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: {
                text: bodyText,
            },
            action: {
                buttons: buttons.map((btn) => ({
                    type: 'reply',
                    reply: {
                        id: btn.id,
                        title: btn.title,
                    },
                })),
            },
        },
    };

    return sendMessage(to, payload);
};

export const sendInteractiveUrlButton = async (to: string, bodyText: string, buttonText: string, url: string, headerText?: string, footerText?: string) => {
    // This function is kept for backward compatibility but delegates to sendMessage
    // Ideally, use Templates.createCTAUrlContent and then sendMessage
    const payload: any = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
            type: 'cta_url',
            body: {
                text: bodyText,
            },
            action: {
                name: 'cta_url',
                parameters: {
                    display_text: buttonText,
                    url: url,
                },
            },
        },
    };

    if (headerText) {
        payload.interactive.header = {
            type: 'text',
            text: headerText,
        };
    }

    if (footerText) {
        payload.interactive.footer = {
            text: footerText,
        };
    }

    return sendMessage(to, payload);
};

export const uploadMedia = async (fileBuffer: Buffer, filename: string, mimeType: string) => {
    try {
        logWithContext('WhatsAppService', `Uploading media: ${filename}`);
        const form = new FormData();
        form.append('file', fileBuffer, { filename, contentType: mimeType });
        form.append('messaging_product', 'whatsapp');

        const response = await axios.post(
            `${config.whatsapp.baseUrl}/${config.whatsapp.apiVersion}/${config.whatsapp.phoneNumberId}/media`,
            form,
            {
                headers: {
                    Authorization: `Bearer ${config.whatsapp.token}`,
                    ...form.getHeaders(),
                },
            }
        );

        logWithContext('WhatsAppService', `Media uploaded successfully`, { mediaId: response.data.id });
        return response.data.id;
    } catch (error: any) {
        logWithContext('WhatsAppService', 'Error uploading media', { error: error.response?.data || error.message }, 'error');
        throw error;
    }
};

export const sendDocument = async (to: string, mediaSource: string, filename: string, caption?: string) => {
    const payload: any = {
        messaging_product: 'whatsapp',
        to,
        type: 'document',
        document: {
            filename: filename,
        },
    };

    if (mediaSource.startsWith('http')) {
        payload.document.link = mediaSource;
    } else {
        payload.document.id = mediaSource;
    }

    if (caption) {
        payload.document.caption = caption;
    }

    return sendMessage(to, payload);
};
