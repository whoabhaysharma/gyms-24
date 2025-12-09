'use client';

import { useEffect, useState } from 'react';
import { subscriptionsAPI } from '@/lib/api/client';
import { Loader2, CreditCard, Calendar, ArrowUpRight, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Payment {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    method: string;
}

interface Subscription {
    id: string;
    plan: {
        name: string;
    };
    gym: {
        name: string;
    };
    payment: Payment | null;
}

export default function PaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            // We use getMySubscriptions because it includes payment info
            const res = await subscriptionsAPI.getMySubscriptions();
            const data = res.data.data || res.data;
            // Filter only subscriptions that have payment info
            const withPayments = data.filter((sub: Subscription) => sub.payment);
            setPayments(withPayments);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'captured':
            case 'success':
                return 'bg-emerald-500/15 text-emerald-600 border-emerald-200';
            case 'failed':
                return 'bg-rose-500/15 text-rose-600 border-rose-200';
            case 'pending':
                return 'bg-amber-500/15 text-amber-600 border-amber-200';
            default:
                return 'bg-zinc-100 text-zinc-500 border-zinc-200';
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
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Payment History</h1>
                <p className="text-zinc-500 text-sm font-medium">View your past transactions</p>
            </div>

            <div className="px-4 space-y-4">
                {payments.length > 0 ? (
                    payments.map((sub) => (
                        <div
                            key={sub.payment!.id}
                            className="bg-white rounded-[24px] p-5 border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
                                        <ArrowUpRight className="w-5 h-5 text-zinc-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 text-sm">{sub.gym.name}</h3>
                                        <p className="text-zinc-500 text-xs font-medium">{sub.plan.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-zinc-900 text-lg">₹{sub.payment!.amount}</p>
                                    <Badge className={`border ${getStatusColor(sub.payment!.status)} shadow-none px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide`}>
                                        {sub.payment!.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>{format(new Date(sub.payment!.createdAt), 'MMM dd, yyyy • hh:mm a')}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                                    <span className="uppercase">{sub.payment!.method || 'Card'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 px-6">
                        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CreditCard className="w-10 h-10 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">No Payments Yet</h3>
                        <p className="text-zinc-500 text-sm mb-8 max-w-[200px] mx-auto">Your payment history will appear here once you make a purchase.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
