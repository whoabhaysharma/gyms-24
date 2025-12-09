import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, gymsAPI } from '@/lib/api/client';

export interface Gym {
    id: string;
    name: string;
    address?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    mobileNumber: string;
    role: string;
    gymsOwned?: Gym[];
}

export function useUserProfileQuery() {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const res = await usersAPI.getMe();
            return (res.data.data || res.data) as UserProfile;
        },
    });
}

export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string }) => usersAPI.updateMe(data),
        onSuccess: (data, variables) => {
             // Optimistic update or invalidation
             queryClient.setQueryData(['userProfile'], (old: UserProfile | undefined) => {
                 if (!old) return old;
                 return { ...old, name: variables.name };
             });
             queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });
}

export function useCreateGymMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; address: string }) => gymsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] }); // Updates list of owned gyms
        },
    });
}
