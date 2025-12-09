import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '@/lib/api/client';
import { toast } from 'sonner';

export interface User {
    id: string;
    name: string;
    mobileNumber: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export function useUsersQuery(params?: { page?: number; limit?: number; includeDeleted?: boolean; search?: string; role?: string }) {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const response = await usersAPI.getAll(params);
            return response.data.data as { data: User[]; meta: any };
        },
    });
}

export function useDeleteUserMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => usersAPI.delete(userId),
        onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        },
    });
}

export function useRestoreUserMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => usersAPI.restore(userId),
        onSuccess: () => {
            toast.success('User restored successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to restore user');
        },
    });
}

export function useAddRoleMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) => usersAPI.addRole(userId, role),
        onSuccess: () => {
            toast.success('Role added successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add role');
        },
    });
}

export function useRemoveRoleMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) => usersAPI.removeRole(userId, role),
        onSuccess: () => {
            toast.success('Role removed successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to remove role');
        },
    });
}
