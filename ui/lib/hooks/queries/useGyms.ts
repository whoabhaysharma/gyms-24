import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gymsAPI } from '@/lib/api/client';
import { toast } from 'sonner';

export interface Gym {
    id: string;
    name: string;
    address: string;
    verified: boolean;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    owner?: {
        name: string;
        email: string;
        mobileNumber: string;
    };
}

export function useGymsQuery(params?: { verified?: boolean; page?: number; limit?: number }) {
    return useQuery({
        queryKey: ['gyms', params],
        queryFn: async () => {
            const response = await gymsAPI.getAll(params);
            return response.data.data as { data: Gym[]; meta: any };
        },
    });
}

export function useVerifyGymMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (gymId: string) => gymsAPI.verify(gymId),
        onSuccess: () => {
            toast.success('Gym verified successfully');
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to verify gym');
        },
    });
}

export function useUnverifyGymMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (gymId: string) => gymsAPI.unverify(gymId),
        onSuccess: () => {
            toast.success('Gym unverified successfully');
            queryClient.invalidateQueries({ queryKey: ['gyms'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to unverify gym');
        },
    });
}
