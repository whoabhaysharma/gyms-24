import { IBackendService, User, Subscription } from './interface';
import { logWithContext } from '../../utils/logger';

export class MockBackendService implements IBackendService {
    async processUserMessage(from: string, message: string, name: string): Promise<any> {
        logWithContext('MockBackend', `Processing user message from: ${from}`, { message, name });
        return {
            reply: `Echo: ${message}`,
            intent: 'unknown'
        };
    }

    async getMagicLink(phoneNumber: string): Promise<string | null> {
        logWithContext('MockBackend', `Generating magic link for: ${phoneNumber}`);
        return `https://app.gyms24.in/booking?token=mock_token_${Date.now()}`;
    }

    async getUserByMobile(mobile: string): Promise<User | null> {
        logWithContext('MockBackend', `Fetching user by mobile: ${mobile}`);
        return {
            id: 'user_mock_001',
            name: 'Test User',
            mobileNumber: mobile,
            roles: ['USER']
        };
    }

    async getSubscriptions(userId: string): Promise<Subscription[]> {
        logWithContext('MockBackend', `Fetching subscriptions for user: ${userId}`);
        return [
            {
                id: 'sub_mock_001',
                userId: userId,
                gymId: 'gym_mock_001',
                planId: 'plan_mock_001',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'ACTIVE',
                accessCode: '123456',
                gym: {
                    id: 'gym_mock_001',
                    name: 'Iron Paradise Gym',
                    address: '123 Muscle Beach, CA'
                },
                plan: {
                    id: 'plan_mock_001',
                    name: 'Gold Membership',
                    price: 2999,
                    durationValue: 1,
                    durationUnit: 'MONTH'
                }
            }
        ];
    }
}
