export interface User {
    id: string;
    name: string;
    mobileNumber: string;
    email?: string;
    roles: string[];
}

export interface Plan {
    id: string;
    name: string;
    price: number;
    durationValue: number;
    durationUnit: string;
}

export interface Gym {
    id: string;
    name: string;
    address: string;
}

export interface Subscription {
    id: string;
    userId: string;
    gymId: string;
    planId: string;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
    accessCode: string;
    gym: Gym;
    plan: Plan;
}

export interface IBackendService {
    processUserMessage(from: string, message: string, name: string): Promise<any>;
    getMagicLink(phoneNumber: string): Promise<string | null>;
    getUserByMobile(mobile: string): Promise<User | null>;
    getSubscriptions(userId: string): Promise<Subscription[]>;
}
