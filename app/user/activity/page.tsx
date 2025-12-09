'use client';

import { useEffect, useState } from 'react';
import { attendanceAPI } from '@/lib/api/client';
import { Loader2, Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceLog {
    id: string;
    checkIn: string;
    checkOut?: string;
    gym: {
        name: string;
        address?: string;
    };
}

export default function ActivityPage() {
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await attendanceAPI.getMe();
                setLogs(res.data.data || res.data);
            } catch (error) {
                console.error("Failed to fetch activity:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24">
            <div className="mx-auto max-w-md px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Activity History</h1>
                    <p className="mt-1 text-sm text-zinc-500 font-medium">Your gym visits and workouts</p>
                </div>

                <div className="space-y-4">
                    {logs.length > 0 ? (
                        logs.map((log) => (
                            <div key={log.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-zinc-900 text-sm">{log.gym.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{log.gym.address || 'Gym Location'}</span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 px-2 py-1 rounded-lg">
                                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>In: {format(new Date(log.checkIn), 'hh:mm a')}</span>
                                        </div>
                                        {log.checkOut && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 px-2 py-1 rounded-lg">
                                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                <span>Out: {format(new Date(log.checkOut), 'hh:mm a')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-zinc-900 font-bold">No Activity Yet</h3>
                            <p className="text-zinc-400 text-sm mt-1">Check in at a gym to see your history here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
