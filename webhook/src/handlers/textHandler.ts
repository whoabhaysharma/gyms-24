import * as WhatsAppService from '../services/whatsapp';
import { logWithContext } from '../utils/logger';

export const handleTextMessage = async (from: string, messageBody: string, name: string, originalFrom: string) => {
    logWithContext('TextHandler', `Handling text message: "${messageBody}"`, { from, name });

    const greetings = ['hi', 'hello', 'start', 'hey', 'hola'];
    const lowerCaseMessage = messageBody.toLowerCase();

    if (greetings.some(greet => lowerCaseMessage.includes(greet))) {
        logWithContext('TextHandler', `Greeting detected. Sending interactive menu.`);
        await WhatsAppService.sendInteractiveButtons(
            originalFrom,
            `Welcome to Gyms24, ${name}! 🏋️‍♂️\n\nYour complete gym booking platform. How can we help you today?`,
            [
                { id: 'book_membership', title: 'Book Membership' },
                { id: 'my_memberships', title: 'My Memberships' },
                { id: 'get_otp', title: 'Get OTP' }
            ]
        );
        return;
    }

    // Default / Fallback
    // You can add NLP processing here
    logWithContext('TextHandler', `No specific handler for message. Ignoring or sending fallback.`);
};
