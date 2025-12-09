'use client';

import { useEffect, useState } from 'react';
import { subscriptionsAPI } from '@/lib/api/client';
import { Loader2, Calendar, MapPin, QrCode, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Subscription {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    accessCode?: string;
    plan: {
        name: string;
        price: number;
        duration: number;
    };
    gym: {
        id: string;
        name: string;
        address?: string;
    };
}

export default function SubscriptionsPage() {
    const router = useRouter();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await subscriptionsAPI.getMySubscriptions();
            const data = res.data.data || res.data;
            setSubscriptions(data);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-emerald-500/15 text-emerald-600 border-emerald-200';
            case 'EXPIRED':
                return 'bg-zinc-100 text-zinc-500 border-zinc-200';
            case 'PENDING':
                return 'bg-amber-500/15 text-amber-600 border-amber-200';
            default:
                return 'bg-zinc-100 text-zinc-500 border-zinc-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'EXPIRED':
                return <XCircle className="w-3.5 h-3.5" />;
            case 'PENDING':
                return <Clock className="w-3.5 h-3.5" />;
            default:
                return <AlertCircle className="w-3.5 h-3.5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-24">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-6 border-b border-zinc-100 rounded-b-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] mb-6">
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">My Subscriptions</h1>
                <p className="text-zinc-500 text-sm font-medium">Manage your active plans and history</p>
            </div>

            <div className="px-4 space-y-4">
                {subscriptions.length > 0 ? (
                    subscriptions.map((sub) => (
                        <div
                            key={sub.id}
                            className="group bg-white rounded-[24px] p-5 border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                        >
                            {sub.status === 'ACTIVE' && (
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 blur-2xl pointer-events-none"></div>
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 leading-tight mb-1">{sub.gym.name}</h3>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-medium">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {sub.gym.address || 'Main Branch'}
                                        </div>
                                    </div>
                                    <Badge className={`border ${getStatusColor(sub.status)} shadow-none px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wide flex items-center gap-1.5`}>
                                        {getStatusIcon(sub.status)}
                                        {sub.status}
                                    </Badge>
                                </div>

                                <div className="bg-zinc-50 rounded-2xl p-4 mb-4 border border-zinc-100/50">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Plan</span>
                                        <span className="text-sm font-bold text-zinc-900">{sub.plan.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Duration</span>
                                        <span className="text-sm font-bold text-zinc-900">{sub.plan.duration} Days</span>
                                    </div>
                                </div>

                                {sub.status === 'ACTIVE' && (
                                    <div className="bg-zinc-900 text-white rounded-2xl p-4 flex items-center justify-between mb-4 shadow-lg shadow-zinc-900/10">
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-1">Access Code</p>
                                            <p className="text-2xl font-mono font-black tracking-widest">{sub.accessCode || '----'}</p>
                                        </div>
                                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
                                            <QrCode className="w-6 h-6 text-zinc-900" />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-100/50">
                                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>
                                        {format(new Date(sub.startDate), 'MMM dd')} - {format(new Date(sub.endDate), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 px-6">
                        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">No Subscriptions Found</h3>
                        <p className="text-zinc-500 text-sm mb-8 max-w-[200px] mx-auto">You haven't subscribed to any gyms yet.</p>
                        <Button
                            onClick={() => router.push('/user/explore')}
                            className="bg-zinc-900 text-white hover:bg-zinc-800 font-bold rounded-xl px-8 h-12 shadow-lg shadow-zinc-900/20"
                        >
                            Explore Gyms
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
