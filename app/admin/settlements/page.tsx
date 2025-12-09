'use client'

import { useState } from 'react';
import {
    useSettlementsQuery,
    useCreateSettlementMutation,
    useUnsettledAmountQuery,
    useUnsettledSummaryQuery,
    useSettlementByIdQuery,
    type Settlement
} from '@/lib/hooks/queries/useSettlements';
import {
    Loader2,
    Check,
    ChevronRight,
    ArrowRight,
    Wallet,
    Building2,
    IndianRupee,
    ReceiptText,
    TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer';
import { format } from 'date-fns';

// --- Types & Helpers ---
type DrawerMode = 'settle' | 'view';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function AdminSettlementsPage() {
    // --- State ---
    const [activeTab, setActiveTab] = useState("unsettled");

    // Unified Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<DrawerMode>('settle');
    const [selectedId, setSelectedId] = useState<string | null>(null); // Holds gymId (settle) or settlementId (view)
    const [selectedName, setSelectedName] = useState<string>("");

    // --- Queries ---
    const { data: settlementsData, isLoading: isHistoryLoading } = useSettlementsQuery();
    const { data: unsettledSummary, isLoading: isSummaryLoading } = useUnsettledSummaryQuery();

    // --- Conditional Queries based on Drawer Mode ---
    // Only fetch unsettled details if drawer is open AND in settle mode
    const { data: unsettledDetails, isLoading: isDetailsLoading } = useUnsettledAmountQuery(
        (isDrawerOpen && drawerMode === 'settle' && selectedId) ? selectedId : undefined
    );

    // Only fetch history details if drawer is open AND in view mode
    const { data: settlementHistoryDetails, isLoading: isHistoryDetailsLoading } = useSettlementByIdQuery(
        (isDrawerOpen && drawerMode === 'view' && selectedId) ? selectedId : undefined
    );

    const createSettlementMutation = useCreateSettlementMutation();

    const settlements: Settlement[] = (settlementsData as any)?.data || (Array.isArray(settlementsData) ? settlementsData : []) || [];
    const pendingList = unsettledSummary || [];
    const totalOutstanding = pendingList.reduce((acc: number, curr: any) => acc + curr.amount, 0);

    // --- Actions ---
    const openDrawer = (mode: DrawerMode, id: string, name: string) => {
        setDrawerMode(mode);
        setSelectedId(id);
        setSelectedName(name);
        setIsDrawerOpen(true);
    };

    const processSettlement = () => {
        if (!selectedId || drawerMode !== 'settle') return;
        createSettlementMutation.mutate(selectedId, {
            onSuccess: () => setIsDrawerOpen(false)
        });
    };

    // --- Shared Components ---
    const PaymentItem = ({ payment }: { payment: any }) => (
        <div className="flex items-center justify-between py-4 group hover:bg-zinc-50/50 transition-colors rounded-lg px-1">
            <div className="flex items-center gap-3.5">
                <Avatar className="h-10 w-10 bg-white border border-zinc-100 shadow-sm">
                    <AvatarFallback className="text-xs text-zinc-600 font-semibold bg-zinc-50">
                        {payment.subscription?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold text-zinc-900 leading-none mb-1.5">
                        {payment.subscription?.user?.name || 'Unknown User'}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-md font-medium text-zinc-500 bg-zinc-100/80 border-0">
                            {payment.subscription?.plan?.name || "Plan"}
                        </Badge>
                        <span className="text-[10px] text-zinc-400">
                            {format(new Date(payment.createdAt), 'MMM d')}
                        </span>
                    </div>
                </div>
            </div>
            <span className="text-sm font-bold text-zinc-900 tabular-nums">
                {formatCurrency(payment.amount)}
            </span>
        </div>
    );

    // Helper to determine which data to show in the drawer
    const activeData = drawerMode === 'settle' ? unsettledDetails : settlementHistoryDetails;
    const isLoading = drawerMode === 'settle' ? isDetailsLoading : isHistoryDetailsLoading;

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans selection:bg-zinc-900 selection:text-white">

            {/* --- Header --- */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 pt-safe-top">
                <div className="px-5 pt-4 pb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-900/20">
                                <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-zinc-600">Admin Finance</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest pl-0.5">Total Outstanding</p>
                        <div className="flex items-baseline gap-1">
                            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter">
                                {formatCurrency(totalOutstanding)}
                            </h2>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Main Tabs --- */}
            <main className="px-4 py-6">
                <Tabs defaultValue="unsettled" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">

                    <TabsList className="grid w-full grid-cols-2 p-1 bg-zinc-100/80">
                        <TabsTrigger value="unsettled" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Pending
                            {pendingList.length > 0 && (
                                <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white">
                                    {pendingList.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            History
                        </TabsTrigger>
                    </TabsList>

                    {/* Pending Settlements Tab */}
                    <TabsContent value="unsettled" className="space-y-3 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        {isSummaryLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300 w-8 h-8" /></div>
                        ) : pendingList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                    <Check className="w-8 h-8 text-zinc-300" />
                                </div>
                                <h3 className="font-semibold text-zinc-900">All caught up</h3>
                                <p className="text-sm text-zinc-500 mt-1">No pending settlements found.</p>
                            </div>
                        ) : (
                            pendingList.map((item: any) => (
                                <Card
                                    key={item.gymId}
                                    className="group relative overflow-hidden border-0 shadow-sm bg-white rounded-2xl cursor-pointer active:scale-[0.98] transition-all duration-200"
                                    onClick={() => openDrawer('settle', item.gymId, item.gymName)}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3.5">
                                                <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-base text-zinc-900 leading-tight mb-1">{item.gymName}</h3>
                                                    <Badge variant="outline" className="text-[10px] font-medium border-zinc-200 text-zinc-500">
                                                        {item.count} Transactions
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-100 group-hover:text-zinc-600 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50/80 rounded-xl p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Wallet className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">Payable</span>
                                            </div>
                                            <span className="font-black text-lg text-zinc-900 tracking-tight">{formatCurrency(item.amount)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-3 outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        {isHistoryLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300 w-8 h-8" /></div>
                        ) : settlements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                    <ReceiptText className="w-8 h-8 text-zinc-300" />
                                </div>
                                <h3 className="font-semibold text-zinc-900">No history found</h3>
                                <p className="text-sm text-zinc-500 mt-1">Past settlements will appear here.</p>
                            </div>
                        ) : (
                            settlements.map((settlement) => (
                                <div
                                    key={settlement.id}
                                    className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-zinc-100 active:bg-zinc-50 transition-colors cursor-pointer"
                                    onClick={() => openDrawer('view', settlement.id, settlement.gym.name)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                                            <ReceiptText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-zinc-900">{settlement.gym.name}</h3>
                                            <p className="text-xs text-zinc-400 mt-0.5 font-medium flex items-center gap-1">
                                                {format(new Date(settlement.createdAt), 'MMM d, yyyy • h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-zinc-900 tracking-tight">{formatCurrency(settlement.amount)}</span>
                                        <div className="inline-flex items-center gap-1 mt-0.5">
                                            <Check className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Paid</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            {/* --- Unified Drawer --- */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="h-[90vh] rounded-t-[28px] flex flex-col after:bg-zinc-900">
                    {/* Header Section */}
                    <DrawerHeader className="text-left px-6 pb-2 shrink-0 pt-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${drawerMode === 'settle' ? 'bg-zinc-100' : 'bg-emerald-50'}`}>
                                {drawerMode === 'settle' ? (
                                    <Building2 className="w-5 h-5 text-zinc-900" />
                                ) : (
                                    <ReceiptText className="w-5 h-5 text-emerald-600" />
                                )}
                            </div>
                            <div>
                                <DrawerTitle className="text-xl font-bold text-zinc-900 leading-none">
                                    {selectedName}
                                </DrawerTitle>
                                <DrawerDescription className="text-xs mt-1">
                                    {drawerMode === 'settle' ? 'Settlement Confirmation' : 'Transaction Receipt'}
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>

                    {/* Dynamic Content Body */}
                    <div className="flex-1 overflow-hidden flex flex-col px-6">
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                            </div>
                        ) : activeData ? (
                            <>
                                <div className="shrink-0 py-6">
                                    {drawerMode === 'settle' ? (
                                        // Mode: Settle Summary Card
                                        <Card className="bg-zinc-900 text-white border-none shadow-xl shadow-zinc-900/10 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-zinc-800 rounded-full blur-2xl opacity-50" />
                                            <CardContent className="p-6 relative z-10">
                                                <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2">Total Transfer Amount</p>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-4xl font-black tracking-tighter text-white">
                                                        {formatCurrency(activeData.amount)}
                                                    </h3>
                                                    <TrendingUp className="w-6 h-6 text-zinc-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        // Mode: History Summary View
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Check className="w-8 h-8 text-emerald-600" />
                                            </div>
                                            <h3 className="text-3xl font-black text-zinc-900 tracking-tighter mb-1">
                                                {formatCurrency(activeData.amount)}
                                            </h3>
                                            <p className="text-sm font-medium text-zinc-500">
                                                Paid on {format(new Date(activeData.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {drawerMode === 'history' && <Separator className="mb-4" />}

                                {/* Shared Breakdown Section */}
                                <div className="flex items-center justify-between mb-2 shrink-0">
                                    <h4 className="text-sm font-bold text-zinc-900">
                                        {drawerMode === 'settle' ? 'Breakdown' : 'Transaction Details'}
                                    </h4>
                                    <span className="text-xs font-medium text-zinc-400">
                                        {activeData.payments?.length} payments
                                    </span>
                                </div>

                                <ScrollArea className="flex-1 -mx-6 px-6">
                                    <div className="space-y-1 pb-4">
                                        {activeData.payments?.map((payment: any) => (
                                            <PaymentItem key={payment.id} payment={payment} />
                                        ))}
                                    </div>
                                </ScrollArea>
                            </>
                        ) : null}
                    </div>

                    {/* Dynamic Footer Actions */}
                    <DrawerFooter className="px-6 pb-8 pt-4 border-t bg-white">
                        {drawerMode === 'settle' ? (
                            <>
                                <Button
                                    className="w-full h-14 rounded-2xl text-base font-bold bg-zinc-900 hover:bg-zinc-800 shadow-xl shadow-zinc-900/10 transition-transform active:scale-[0.98]"
                                    onClick={processSettlement}
                                    disabled={createSettlementMutation.isPending}
                                >
                                    {createSettlementMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span>Transfer Funds</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </Button>
                                <DrawerClose asChild>
                                    <Button variant="ghost" className="h-12 rounded-xl text-zinc-500 hover:text-zinc-900 font-semibold">Cancel</Button>
                                </DrawerClose>
                            </>
                        ) : (
                            <DrawerClose asChild>
                                <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-zinc-200 text-zinc-700">Close Receipt</Button>
                            </DrawerClose>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}