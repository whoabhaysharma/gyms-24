import { RequestHandler } from 'express';
import { sendSuccess, sendInternalError, sendForbidden } from '../utils/response';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';
import { getAuthUser } from '../utils/getAuthUser';
import logger from '../lib/logger';

import { redis } from '../lib/redis';

export const getDashboardStats: RequestHandler = async (req, res) => {
    const user = getAuthUser(req);

    if (!user?.roles?.includes(Role.ADMIN)) {
        return sendForbidden(res, 'Only admin can view dashboard stats');
    }

    try {
        const [totalUsers, totalGyms, totalRevenue, recentGyms, recentUsers] = await Promise.all([
            prisma.user.count(),
            prisma.gym.count(),
            prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            prisma.gym.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, createdAt: true }
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, createdAt: true }
            })
        ]);

        const recentActivity = [
            ...recentGyms.map(g => ({ type: 'GYM_CREATED', title: g.name, time: g.createdAt })),
            ...recentUsers.map(u => ({ type: 'USER_JOINED', title: u.name, time: u.createdAt }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

        return sendSuccess(res, {
            totalUsers,
            totalGyms,
            totalRevenue: totalRevenue._sum.amount || 0,
            recentActivity
        });
    } catch (error) {
        logger.error('Error fetching admin dashboard stats:', error);
        return sendInternalError(res);
    }
};

export const getOtp: RequestHandler = async (req, res) => {
    const user = getAuthUser(req);

    if (!user?.roles?.includes(Role.ADMIN)) {
        return sendForbidden(res, 'Only admin can view OTPs');
    }

    const { mobile } = req.query;

    if (!mobile || typeof mobile !== 'string') {
        return sendInternalError(res, 'Mobile number is required');
    }

    try {
        const otp = await redis.get(`otp:${mobile}`);

        if (!otp) {
            return sendSuccess(res, { otp: null, message: 'No active OTP found for this number' });
        }

        return sendSuccess(res, { otp });
    } catch (error) {
        logger.error('Error fetching OTP:', error);
        return sendInternalError(res);
    }
};
