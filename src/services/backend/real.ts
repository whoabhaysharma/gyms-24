import axios, { AxiosInstance } from 'axios';
import { IBackendService, User, Subscription } from './interface';
import { config } from '../../config/config';
import { logWithContext } from '../../utils/logger';

export class RealBackendService implements IBackendService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.backend.url,
            headers: {
                'x-internal-secret': config.backend.internalSecret,
                'Content-Type': 'application/json',
            },
        });
    }

    private formatPhoneNumber(mobile: string): string {
        if (mobile.startsWith('91') && mobile.length === 12) {
            return mobile.substring(2);
        }
        return mobile;
    }

    async processUserMessage(from: string, message: string, name: string): Promise<any> {
        // The backend does not have a generic /whatsapp/process endpoint.
        // Logic is handled by the webhook handlers (textHandler, buttonHandler).
        // This method is kept for interface compliance but does nothing.
        logWithContext('RealBackend', `processUserMessage called for ${from} (No-op)`);
        return null;
    }

    async getMagicLink(phoneNumber: string): Promise<string | null> {
        try {
            logWithContext('RealBackend', `Fetching magic link for: ${phoneNumber}`);
            const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
            const response = await this.client.post('/auth/magic-link', { phoneNumber: formattedPhoneNumber });
            return response.data.data.magicLink;
        } catch (error: any) {
            logWithContext('RealBackend', 'Error fetching magic link', { error: error.message }, 'error');
            return null;
        }
    }

    async getUserByMobile(mobile: string): Promise<User | null> {
        try {
            logWithContext('RealBackend', `Fetching user by mobile: ${mobile}`);
            const formattedMobile = this.formatPhoneNumber(mobile);

            const response = await this.client.get('/users', {
                params: { search: formattedMobile, role: 'USER' }
            });

            // Response structure: { success: true, data: { data: [users], meta: ... } }
            if (response.data.success && response.data.data && response.data.data.data && response.data.data.data.length > 0) {
                const users = response.data.data.data;
                // Find exact match
                const exactMatch = users.find((u: User) => u.mobileNumber === formattedMobile);
                if (exactMatch) {
                    return exactMatch;
                }
                // Fallback to first result
                return users[0];
            }
            return null;
        } catch (error: any) {
            logWithContext('RealBackend', 'Error fetching user', { error: error.message }, 'error');
            return null;
        }
    }

    async getSubscriptions(userId: string): Promise<Subscription[]> {
        try {
            logWithContext('RealBackend', `Fetching subscriptions for user: ${userId}`);
            const response = await this.client.get('/subscriptions', {
                params: { userId, status: 'ACTIVE' }
            });
            // Response structure from subscription.controller is direct JSON: { data: [subs], meta: ... }
            // It does NOT use sendSuccess wrapper.
            return response.data.data || [];
        } catch (error: any) {
            logWithContext('RealBackend', 'Error fetching subscriptions', { error: error.message }, 'error');
            return [];
        }
    }
}
