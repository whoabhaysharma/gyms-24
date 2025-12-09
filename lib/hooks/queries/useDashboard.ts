import { useQuery, useMutation } from '@tanstack/react-query';
import { gymsAPI, attendanceAPI, settlementsAPI } from '@/lib/api/client';

export interface RecentActivityItem {
    title: string;
    time: string;
    amount?: number;
}

export interface DashboardStats {
    totalRevenue: number;
    activeMembers: number;
    unsettledAmount: number;
    recentActivity: RecentActivityItem[];
}

export function useGymStatsQuery(gymId?: string) {
    return useQuery({
        queryKey: ['gymStats', gymId],
        queryFn: async () => {
            if (!gymId) throw new Error('Gym ID is required');

            // Fetch stats and unsettled amount in parallel
            const [statsRes, unsettledRes] = await Promise.all([
                gymsAPI.getStats(gymId),
                settlementsAPI.getUnsettledAmount(gymId)
            ]);

            const statsData = statsRes.data.data || statsRes.data;
            const unsettledData = unsettledRes.data.data || unsettledRes.data;

            return {
                totalRevenue: statsData.totalRevenue,
                activeMembers: statsData.activeMembers,
                unsettledAmount: unsettledData.amount || 0,
                recentActivity: statsData.recentActivity
            } as DashboardStats;
        },
        enabled: !!gymId,
    });
}

export function useCheckInMutation(gymId: string) {
    return useMutation({
        mutationFn: (accessCode: string) => attendanceAPI.verifyCheckIn(gymId, accessCode),
    });
}
