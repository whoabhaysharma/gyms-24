import { useQuery } from '@tanstack/react-query';
import { paymentsAPI, settlementsAPI } from '@/lib/api/client';

export interface Payment {
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
    settlementId?: string;
    subscription?: {
        user?: { name: string };
        plan?: { name: string };
    };
}

export interface Settlement {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    transactionId?: string;
}

export function usePaymentsQuery(gymId?: string) {
    return useQuery({
        queryKey: ['payments', gymId],
        queryFn: async () => {
            if (!gymId) throw new Error('Gym ID is required');
            const res = await paymentsAPI.getAll({ gymId, limit: 50 });
            return (res.data.data || []) as Payment[];
        },
        enabled: !!gymId,
    });
}

export function useSettlementsQuery(gymId?: string) {
    return useQuery({
        queryKey: ['settlements', gymId],
        queryFn: async () => {
            if (!gymId) throw new Error('Gym ID is required');
            const res = await settlementsAPI.getAll({ gymId });
            return (res.data.data || []) as Settlement[];
        },
        enabled: !!gymId,
    });
}

export function useUnsettledAmountQuery(gymId?: string) {
    return useQuery({
        queryKey: ['unsettledAmount', gymId],
        queryFn: async () => {
            if (!gymId) throw new Error('Gym ID is required');
            const res = await settlementsAPI.getUnsettledAmount(gymId);
            const data = res.data.data || res.data;
            return (data.amount || 0) as number;
        },
        enabled: !!gymId,
    });
}
