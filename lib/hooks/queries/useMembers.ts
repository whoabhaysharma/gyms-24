import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsAPI, plansAPI } from '@/lib/api/client';

export interface Member {
    id: string
    name: string
    phone: string
    accessCode: string
    status: "active" | "inactive" | "expiring" | "pending"
    lastVisit?: string
    // Subscription details
    planName?: string
    startDate?: string
    endDate?: string
    price?: number
}

// Helper function to format time ago (duplicated from original component for now, or could be moved to utils)
function formatTimeAgo(dateString?: string) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
}

export function useMembersQuery(gymId?: string) {
    return useQuery({
        queryKey: ['members', gymId],
        queryFn: async () => {
            if (!gymId) throw new Error('Gym ID is required');
            const subsRes = await subscriptionsAPI.getByGymId(gymId);
            const subscriptions = subsRes.data.data || subsRes.data;

            // Map to Member interface
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return subscriptions.map((sub: any) => ({
                id: sub.id,
                name: sub.user.name,
                phone: sub.user.mobileNumber || 'N/A',
                accessCode: sub.accessCode || 'PENDING',
                status: sub.status.toLowerCase(),
                lastCheckIn: sub.lastCheckIn, // Keep raw for sorting if needed
                lastVisit: formatTimeAgo(sub.lastCheckIn),
                planName: sub.plan.name,
                startDate: new Date(sub.startDate).toLocaleDateString(),
                endDate: new Date(sub.endDate).toLocaleDateString(),
                price: sub.plan.price
            })) as Member[];
        },
        enabled: !!gymId,
    });
}

export function usePlansQuery(gymId?: string) {
    return useQuery({
        queryKey: ['plans', gymId],
        queryFn: async () => {
            if (!gymId) throw new Error('Gym ID is required');
            const res = await plansAPI.getActiveByGymId(gymId);
            return res.data.data || res.data;
        },
        enabled: !!gymId,
    });
}

export function useAddMemberMutation(gymId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; mobileNumber: string; planId: string }) =>
            subscriptionsAPI.createConsole({ ...data, gymId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', gymId] });
        },
    });
}

export function useActivateSubscriptionMutation(gymId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => subscriptionsAPI.activate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', gymId] });
        },
    });
}
