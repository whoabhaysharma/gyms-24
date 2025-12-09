import { BackendService } from '../services/backend';
import * as WhatsAppService from '../services/whatsapp';
import * as Templates from '../services/templates';
import { logWithContext } from '../utils/logger';
import redis from '../utils/redis';

export const handleButtonClick = async (from: string, buttonId: string, name: string, originalFrom: string) => {
    logWithContext('ButtonHandler', `Handling button click: ${buttonId}`, { from, name });

    switch (buttonId) {
        case 'book_membership':
            await handleBookMembership(from, originalFrom);
            break;
        case 'my_memberships':
            await handleMyMemberships(from, name, originalFrom);
            break;
        case 'get_otp':
            await handleGetOtp(from, originalFrom);
            break;
        default:
            logWithContext('ButtonHandler', `Unknown button ID: ${buttonId}`, {}, 'warn');
            break;
    }
};

const handleBookMembership = async (from: string, originalFrom: string) => {
    // 1. Get Magic Link
    const magicLink = await BackendService.getMagicLink(from);

    if (magicLink) {
        // 2. Send Magic Link via CTA Button
        const messageContent = Templates.createCTAUrlContent(
            `Great! 🏋️‍♂️\n\nClick the button below to browse gyms, choose a plan, and book your membership securely.`,
            'Book Now',
            magicLink,
            'Secure Booking',
            'Gyms24'
        );
        await WhatsAppService.sendMessage(originalFrom, messageContent);
    } else {
        // Fallback if magic link fails
        await WhatsAppService.sendMessage(originalFrom, 'Sorry, we could not generate a booking link at this time. Please try again later.');
    }
};

const handleMyMemberships = async (from: string, name: string, originalFrom: string) => {
    const user = await BackendService.getUserByMobile(from);

    if (!user) {
        await WhatsAppService.sendMessage(originalFrom, 'We could not find an account associated with this number. Please book a membership first!');
        return;
    }

    const subscriptions = await BackendService.getSubscriptions(user.id);

    if (subscriptions.length > 0) {
        let response = `*Active Memberships for ${name}:*\n\n`;
        subscriptions.forEach((sub) => {
            const endDate = new Date(sub.endDate).toLocaleDateString();
            response += `🏋️ *${sub.gym.name}*\n📦 Plan: ${sub.plan.name}\n📅 Expires: ${endDate}\n🔑 Access Code: *${sub.accessCode}*\n\n`;
        });
        await WhatsAppService.sendMessage(originalFrom, response);
    } else {
        await WhatsAppService.sendMessage(originalFrom, 'You have no active memberships. Click "Book Membership" to get started!');
    }
};

const handleGetOtp = async (from: string, originalFrom: string) => {
    // Normalize phone number (remove 91 prefix if present)
    let normalizedMobile = from;
    if (normalizedMobile.startsWith('91') && normalizedMobile.length === 12) {
        normalizedMobile = normalizedMobile.substring(2);
    }

    try {
        const otp = await redis.get(`otp:${normalizedMobile}`);

        if (otp) {
            await WhatsAppService.sendMessage(originalFrom, `Your OTP is: *${otp}*\n\nThis OTP is valid for 5 minutes.`);
        } else {
            await WhatsAppService.sendMessage(originalFrom, `No active OTP found for your number. Please request a new OTP from the app.`);
        }
    } catch (error) {
        logWithContext('ButtonHandler', `Error fetching OTP from Redis: ${error}`, {}, 'error');
        await WhatsAppService.sendMessage(originalFrom, `Sorry, something went wrong while retrieving your OTP. Please try again later.`);
    }
};
