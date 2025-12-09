import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendOtp: (phoneNumber: string) =>
    apiClient.post('/auth/send-otp', { phoneNumber }),
  verifyOtp: (phoneNumber: string, otp: number) =>
    apiClient.post('/auth/verify-otp', { phoneNumber, otp }),
  updateProfile: (userId: string, data: { mobileNumber?: string; name?: string }) =>
    apiClient.patch(`/auth/profile/${userId}`, data),
};

export const gymsAPI = {
  create: (data: { name: string; address: string; ownerId?: string }) =>
    apiClient.post('/gyms', data),
  getAll: (params?: { verified?: boolean; page?: number; limit?: number }) => apiClient.get('/gyms', { params }),
  getMyOwned: () => apiClient.get('/gyms/me/owned'),
  getById: (id: string) => apiClient.get(`/gyms/${id}`),
  update: (id: string, data: { name?: string; address?: string }) =>
    apiClient.put(`/gyms/${id}`, data),
  delete: (id: string) => apiClient.delete(`/gyms/${id}`),
  verify: (id: string) => apiClient.patch(`/gyms/${id}/verify`),
  unverify: (id: string) => apiClient.patch(`/gyms/${id}/unverify`),
  getStats: (id: string) => apiClient.get(`/gyms/${id}/stats`),
};

export const plansAPI = {
  create: (data: {
    gymId: string;
    name: string;
    description?: string;
    durationValue: number;
    durationUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    price: number
  }) => apiClient.post('/plans', data),
  getByGymId: (gymId: string) => apiClient.get(`/plans?gymId=${gymId}`),
  getActiveByGymId: (gymId: string) => apiClient.get(`/plans/active?gymId=${gymId}`),
  getById: (id: string) => apiClient.get(`/plans/${id}`),
  update: (id: string, data: Partial<{
    name: string;
    description: string;
    durationValue: number;
    durationUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    price: number;
    isActive: boolean;
  }>) => apiClient.put(`/plans/${id}`, data),
  delete: (id: string) => apiClient.delete(`/plans/${id}`),
};

export const usersAPI = {
  getMe: () => apiClient.get('/users/me/profile'),
  updateMe: (data: { name: string }) => apiClient.put('/users/me/profile', data),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  getAll: (params?: { page?: number; limit?: number; includeDeleted?: boolean; search?: string; role?: string }) =>
    apiClient.get('/users', { params }),
  update: (id: string, data: { name: string }) => apiClient.put(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  restore: (id: string) => apiClient.post(`/users/${id}/restore`),
  addRole: (id: string, role: string) => apiClient.post(`/users/${id}/role`, { role, action: 'add' }),
  removeRole: (id: string, role: string) => apiClient.post(`/users/${id}/role`, { role, action: 'remove' }),
  upgradeToOwner: () => apiClient.post('/users/me/upgrade-to-owner'),
};

export const subscriptionsAPI = {
  create: (data: { planId: string; gymId: string }) => apiClient.post('/subscriptions', data),
  createConsole: (data: { userId?: string; name?: string; mobileNumber?: string; planId: string; gymId: string }) => apiClient.post('/subscriptions/console', data),
  getMySubscriptions: () => apiClient.get('/subscriptions/my-subscriptions'),
  getByGymId: (gymId: string) => apiClient.get(`/subscriptions?gymId=${gymId}`),
  activate: (id: string) => apiClient.patch(`/subscriptions/${id}/activate`),
};

export const paymentsAPI = {
  verify: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    apiClient.post('/payments/verify', data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll: (params?: Record<string, any>) => apiClient.get('/payments', { params }),
};

export const settlementsAPI = {
  create: (data: { gymId: string }) => apiClient.post('/settlements', data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll: (params?: Record<string, any>) => apiClient.get('/settlements', { params }),
  getUnsettledSummary: () => apiClient.get('/settlements/unsettled-summary'),
  getUnsettledAmount: (gymId: string) => apiClient.get(`/settlements/unsettled?gymId=${gymId}`),
  getById: (id: string) => apiClient.get(`/settlements/${id}`),
};

export const attendanceAPI = {
  getMe: (gymId?: string) => apiClient.get(`/attendance/me${gymId ? `?gymId=${gymId}` : ''}`),
  checkIn: (gymId: string) => apiClient.post(`/attendance/gym/${gymId}/check-in`),
  checkOut: (attendanceId: string) => apiClient.post(`/attendance/${attendanceId}/check-out`),
  verifyCheckIn: (gymId: string, accessCode: string) => apiClient.post(`/attendance/gym/${gymId}/verify-check-in`, { accessCode }),
  getByGymId: (gymId: string) => apiClient.get(`/attendance?gymId=${gymId}`), // Speculative
};

export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
};

export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/dashboard-stats'),
};

export const auditLogsAPI = {
  getAll: (params?: { gymId?: string; page?: number; limit?: number }) => apiClient.get('/audit/admin/all', { params }),
  getGymLogs: (gymId: string, params?: { page?: number; limit?: number }) => apiClient.get(`/audit/gym/${gymId}`, { params }),
  getMyLogs: (params?: { page?: number; limit?: number }) => apiClient.get('/audit/me', { params }),
};

export default apiClient;
