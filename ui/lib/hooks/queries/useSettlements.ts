import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementsAPI } from '@/lib/api/client';
import { toast } from 'sonner';

export interface Settlement {
    id: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    gymId: string;
    gym: {
        name: string;
        owner: {
            name: string;
            mobileNumber: string;
        };
    };
    createdAt: string;
    processedAt?: string;
}

export function useSettlementsQuery(params?: { status?: string; gymId?: string; page?: number; limit?: number }) {
    return useQuery({
        queryKey: ['settlements', params],
        queryFn: async () => {
            const response = await settlementsAPI.getAll(params);
            return response.data as { data: Settlement[]; meta: any };
        },
    });
}

export function useCreateSettlementMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (gymId: string) => settlementsAPI.create({ gymId }),
        onSuccess: () => {
            toast.success('Settlement processed successfully');
            queryClient.invalidateQueries({ queryKey: ['settlements'] });
            queryClient.invalidateQueries({ queryKey: ['unsettledAmount'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to process settlement');
        },
    });
}

export function useUnsettledAmountQuery(gymId?: string) {
    return useQuery({
        queryKey: ['unsettledAmount', gymId],
        queryFn: async () => {
            if (!gymId) return { amount: 0 };
            const response = await settlementsAPI.getUnsettledAmount(gymId);
            return response.data.data || response.data;
        },
        enabled: !!gymId,
    });
}

export function useUnsettledSummaryQuery() {
    return useQuery({
        queryKey: ['unsettledSummary'],
        queryFn: async () => {
            const response = await settlementsAPI.getUnsettledSummary();
            return response.data.data;
        },
    });
}
export function useSettlementByIdQuery(id?: string) {
    return useQuery({
        queryKey: ['settlement', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await settlementsAPI.getById(id);
            return response.data.data;
        },
        enabled: !!id,
    });
}
