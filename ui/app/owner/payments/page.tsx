'use client';

import { useState } from 'react';
import { useOwnerStore } from '@/lib/store/ownerStore';
import { Loader2, IndianRupee, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePaymentsQuery, useSettlementsQuery, useUnsettledAmountQuery } from '@/lib/hooks/queries/usePayments';

export default function PaymentsPage() {
    const { currentGym } = useOwnerStore();
    const [activeTab, setActiveTab] = useState<'payments' | 'settlements'>('payments');

    const {
        data: paymentsData,
        isLoading: isPaymentsLoading,
        refetch: refetchPayments
    } = usePaymentsQuery(currentGym?.id);

    const {
        data: settlementsData,
        isLoading: isSettlementsLoading,
        refetch: refetchSettlements
    } = useSettlementsQuery(currentGym?.id);

    const {
        data: unsettledAmountData,
        refetch: refetchUnsettled
    } = useUnsettledAmountQuery(currentGym?.id);

    const payments = paymentsData || [];
    const settlements = settlementsData || [];
    const unsettledAmount = unsettledAmountData || 0;

    const handleRefresh = () => {
        refetchPayments();
        refetchSettlements();
        refetchUnsettled();
    };

    const showLoader = isPaymentsLoading || isSettlementsLoading;

    if (showLoader && currentGym) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-24">
            {/* Header */}
            <div className="bg-white px-6 pt-8 pb-6 border-b border-zinc-100 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-zinc-900">Payments & Settlements</h1>
                    <Button variant="outline" size="icon" onClick={handleRefresh} className="rounded-full h-10 w-10">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>

                {/* Unsettled Amount Card */}
                <div className="bg-zinc-900 text-white p-6 rounded-3xl shadow-xl shadow-zinc-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <IndianRupee className="w-32 h-32" />
                    </div>
                    <p className="text-zinc-400 text-sm font-medium mb-1">Unsettled Amount</p>
                    <h2 className="text-4xl font-bold">₹{unsettledAmount.toLocaleString()}</h2>
                    <p className="text-zinc-500 text-xs mt-2">
                        Pending payout from online payments.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-8 bg-zinc-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'payments'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        All Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('settlements')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'settlements'
                            ? 'bg-white text-zinc-900 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                    >
                        Settlements
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6">
                {activeTab === 'payments' ? (
                    <div className="space-y-3">
                        {payments.length === 0 ? (
                            <div className="text-center py-12 text-zinc-400">No payments found</div>
                        ) : (
                            payments.map((payment) => (
                                <div key={payment.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-zinc-900">{payment.subscription?.user?.name || 'Unknown User'}</h3>
                                            <p className="text-xs text-zinc-500">{payment.subscription?.plan?.name || 'Unknown Plan'}</p>
                                        </div>
                                        <span className="font-bold text-zinc-900">₹{payment.amount}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'destructive'} className="text-[10px] h-5 px-2">
                                                {payment.status}
                                            </Badge>
                                            <span className="text-[10px] text-zinc-400">
                                                {format(new Date(payment.createdAt), 'dd MMM, hh:mm a')}
                                            </span>
                                        </div>
                                        {payment.method === 'ONLINE' || payment.method === 'UPI' || payment.method === 'CARD' ? (
                                            <div className="flex items-center gap-1">
                                                {payment.settlementId ? (
                                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Settled
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Unsettled
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full">
                                                Cash / Manual
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {settlements.length === 0 ? (
                            <div className="text-center py-12 text-zinc-400">No settlements found</div>
                        ) : (
                            settlements.map((settlement) => (
                                <div key={settlement.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-zinc-900">Settlement #{settlement.id.slice(-6)}</h3>
                                            <p className="text-xs text-zinc-500">
                                                {format(new Date(settlement.createdAt), 'dd MMM yyyy, hh:mm a')}
                                            </p>
                                        </div>
                                        <span className="font-bold text-zinc-900">₹{settlement.amount}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
                                        <Badge
                                            className={`text-[10px] h-5 px-2 ${settlement.status === 'PROCESSED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                settlement.status === 'PENDING' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                                                    'bg-red-100 text-red-700 hover:bg-red-100'
                                                }`}
                                        >
                                            {settlement.status}
                                        </Badge>
                                        {settlement.transactionId && (
                                            <span className="text-[10px] text-zinc-400 font-mono">
                                                Ref: {settlement.transactionId}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
