import * as WhatsAppService from '../services/whatsapp';
import { handleButtonClick } from './buttonHandler';
import { handleTextMessage } from './textHandler';
import { logWithContext } from '../utils/logger';

export const handleIncomingMessage = async (message: any, contacts: any) => {
    const originalFrom = message.from;
    let from = originalFrom;

    // Strip '91' prefix if present (assuming Indian numbers for now)
    if (from.startsWith('91') && from.length === 12) {
        from = from.substring(2);
    }

    const name = contacts?.[0]?.profile?.name || 'Unknown';

    logWithContext('MessageHandler', `Processing message`, { originalFrom, from, name, type: message.type });

    try {
        // 1. Mark as read
        await WhatsAppService.markAsRead(message.id);

        // 2. Handle Interactive Button Replies
        if (message.type === 'interactive' && message.interactive.type === 'button_reply') {
            const buttonId = message.interactive.button_reply.id;
            await handleButtonClick(from, buttonId, name, originalFrom);
            return;
        }

        // 3. Handle Text Messages
        if (message.type === 'text' && message.text) {
            await handleTextMessage(from, message.text.body, name, originalFrom);
            return;
        }

        logWithContext('MessageHandler', `Unsupported message type: ${message.type}`, {}, 'warn');

    } catch (error: any) {
        logWithContext('MessageHandler', 'Error handling message', { error: error.message }, 'error');
        throw error;
    }
};
