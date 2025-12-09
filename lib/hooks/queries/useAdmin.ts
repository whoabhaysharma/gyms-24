import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api/client';

export interface AdminDashboardStats {
    totalUsers: number;
    totalGyms: number;
    totalRevenue: number;
    recentActivity: {
        type: 'USER_JOINED' | 'GYM_CREATED';
        title: string;
        time: string;
    }[];
}

export function useAdminStatsQuery() {
    return useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const response = await adminAPI.getDashboardStats();
            return response.data.data as AdminDashboardStats;
        },
    });
}
