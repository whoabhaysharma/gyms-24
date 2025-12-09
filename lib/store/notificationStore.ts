import { create } from 'zustand';
import { notificationsAPI } from '../api/client';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    isRead: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const res = await notificationsAPI.getAll();
            const { notifications, unreadCount } = res.data.data || res.data;
            set({ notifications, unreadCount });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await notificationsAPI.markAsRead(id);
            set((state) => {
                const updatedNotifications = state.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                const updatedUnreadCount = updatedNotifications.filter((n) => !n.isRead).length;
                return { notifications: updatedNotifications, unreadCount: updatedUnreadCount };
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await notificationsAPI.markAllAsRead();
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    },
}));
