import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/lib/api/client';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    isRead: boolean;
    createdAt: string;
}

export function useNotificationsQuery() {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await notificationsAPI.getAll();
            console.log('Raw Notifications Response:', res.data);

            const body = res.data;
            let notifications: any[] = [];
            let unreadCount = 0;

            // Structure: { success: true, data: { data: [...], meta: {...} } }
            if (body?.data?.data && Array.isArray(body.data.data)) {
                notifications = body.data.data;
                unreadCount = body.data.meta?.unreadCount || 0;
            }
            // Fallback for different structures
            else if (body?.data?.notifications && Array.isArray(body.data.notifications)) {
                notifications = body.data.notifications;
                unreadCount = body.data.unreadCount || 0;
            }
            else if (Array.isArray(body?.data)) {
                notifications = body.data;
            }

            console.log('Parsed Notifications:', notifications);

            return {
                notifications: notifications as Notification[],
                unreadCount: unreadCount as number
            };
        }
    });
}

export function useMarkNotificationReadMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationsAPI.markAsRead(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });

            const previousData = queryClient.getQueryData<{ notifications: Notification[], unreadCount: number }>(['notifications']);

            if (previousData) {
                const updatedNotifications = previousData.notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                const updatedUnreadCount = updatedNotifications.filter(n => !n.isRead).length;

                queryClient.setQueryData(['notifications'], {
                    notifications: updatedNotifications,
                    unreadCount: updatedUnreadCount
                });
            }

            return { previousData };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['notifications'], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

export function useMarkAllNotificationsReadMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationsAPI.markAllAsRead(),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            const previousData = queryClient.getQueryData<{ notifications: Notification[], unreadCount: number }>(['notifications']);

            if (previousData) {
                queryClient.setQueryData(['notifications'], {
                    notifications: previousData.notifications.map(n => ({ ...n, isRead: true })),
                    unreadCount: 0
                });
            }
            return { previousData };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(['notifications'], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
