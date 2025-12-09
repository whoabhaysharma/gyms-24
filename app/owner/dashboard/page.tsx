'use client'

import { Activity, User, Calendar, CreditCard, Wallet, Users, AlertCircle, ArrowUpRight } from "lucide-react"
// SHADCN Drawer import
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { useState } from "react";
import { useOwnerStore } from "@/lib/store/ownerStore";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, isPast } from "date-fns";
import { useRouter } from "next/navigation";
import { useGymStatsQuery, useCheckInMutation } from "@/lib/hooks/queries/useDashboard";
import { cn } from "@/lib/utils";
import { NotificationDrawer } from "@/components/dashboard/NotificationDrawer";

// ---------------------------------------
// Types
// ---------------------------------------
interface StatsCardProps {
    label: string
    value: string
    change?: string
    positive?: boolean
    icon?: React.ReactNode
    className?: string
    variant?: 'default' | 'danger'
}

interface RecentItemProps {
    title: string
    time: string
    amount?: string
}

// ---------------------------------------
// Header Component
// ---------------------------------------
export function OwnerHeader() {
    const { currentGym } = useOwnerStore();
    const user = { name: currentGym?.ownerName || 'Gym Owner', avatar: 'GO' };

    return (
        <header className={'bg-transparent pt-6 pb-2'}>
            <div className="flex items-center justify-between max-w-md mx-auto w-full relative">
                {/* Profile */}
                <div className="flex items-center gap-3">
                    <div className="relative group cursor-pointer transition-transform active:scale-95">
                        <div className="h-11 w-11 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                            {user.avatar}
                        </div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">Welcome Back</p>
                        <h1 className="text-xl font-extrabold text-zinc-900 leading-none tracking-tight">{user.name}</h1>
                    </div>
                </div>

                {/* Notification Drawer */}
                <div className="flex items-center gap-2 relative">
                    <NotificationDrawer />
                </div>
            </div>
        </header>
    );
}

// ---------------------------------------
// Stats Components
// ---------------------------------------
function StatsCard({ label, value, change, positive, icon, className, variant = 'default' }: StatsCardProps) {
    const isDanger = variant === 'danger';

    return (
        <div className={cn(
            "p-5 rounded-[24px] border transition-all duration-200 relative overflow-hidden group",
            isDanger
                ? "bg-rose-50/50 border-rose-100"
                : "bg-white border-zinc-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)]",
            className
        )}>
            {/* Background decoration */}
            <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-110",
                isDanger ? "bg-rose-500" : "bg-zinc-900"
            )} />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className={cn(
                        "p-2 rounded-full w-fit",
                        isDanger ? "bg-rose-100 text-rose-600" : "bg-zinc-50 text-zinc-500"
                    )}>
                        {icon}
                    </div>
                    {change && (
                        <div className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1",
                            positive
                                ? "bg-green-50 text-green-700"
                                : (isDanger ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-500")
                        )}>
                            {positive ? <ArrowUpRight className="w-3 h-3" /> : null}
                            {change}
                        </div>
                    )}
                </div>

                <div>
                    <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", isDanger ? "text-rose-400" : "text-zinc-400")}>
                        {label}
                    </p>
                    <h3 className={cn("text-2xl font-black tracking-tight", isDanger ? "text-rose-950" : "text-zinc-900")}>
                        {value}
                    </h3>
                </div>
            </div>
        </div>
    )
}

function HeroRevenueCard({ value, change }: { value: string, change: string }) {
    return (
        <div className="bg-white p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <Wallet className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Total Revenue</p>
                        <h2 className="text-4xl font-black text-zinc-900 tracking-tight">{value}</h2>
                    </div>
                    <div className="bg-green-50 p-2 rounded-xl">
                        <ArrowUpRight className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md">+{change}</span>
                    <span className="text-zinc-400 text-xs font-medium">vs last month</span>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------
// Quick Actions Section
// ---------------------------------------
function QuickActions({ onCheckInClick, onPaymentsClick }: { onCheckInClick: () => void; onPaymentsClick: () => void }) {
    return (
        <div className="bg-zinc-900 text-white p-6 rounded-[28px] shadow-xl shadow-zinc-200 relative overflow-hidden">
            {/* Texture/Grain could go here */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-800 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Quick Actions</h3>
                        <p className="text-zinc-400 text-xs">Manage your gym daily tasks</p>
                    </div>
                    <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onPaymentsClick}
                        className="group flex flex-col items-center justify-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 py-4 rounded-2xl transition-all active:scale-[0.98]"
                    >
                        <Wallet className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
                        <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">Payments</span>
                    </button>
                    <button
                        onClick={onCheckInClick}
                        className="group flex flex-col items-center justify-center gap-2 bg-white text-zinc-900 py-4 rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-[0.98]"
                    >
                        <div className="bg-zinc-100 p-1 rounded-md">
                            <Users className="w-4 h-4 text-zinc-900" />
                        </div>
                        <span className="text-xs">Check-in</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------
// Recent Activity List
// ---------------------------------------
function RecentActivityList({ items }: { items: RecentItemProps[] }) {
    if (items.length === 0) {
        return (
            <div className="mt-2">
                <h3 className="font-bold text-zinc-800 text-lg mb-4 px-1">Recent Activity</h3>
                <div className="p-8 text-center bg-white rounded-[24px] border border-zinc-100 border-dashed">
                    <p className="text-zinc-400 text-sm">No recent activity recorded.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-2">
            <h3 className="font-bold text-zinc-800 text-lg mb-4 px-1">Recent Activity</h3>
            <div className="space-y-3 pb-32">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-50 shadow-sm hover:border-zinc-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 text-zinc-400">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-zinc-800 text-sm">{item.title}</p>
                                <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-wide">{item.time}</p>
                            </div>
                        </div>
                        {item.amount && (
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                {item.amount}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ---------------------------------------
// Main Dashboard Component
// ---------------------------------------
export default function DashboardContent() {
    const router = useRouter();
    const { currentGym, isLoading: isGymLoading } = useOwnerStore();

    const { data: stats, isLoading: statsLoading, isError: statsError } = useGymStatsQuery(currentGym?.id);
    const checkInMutation = useCheckInMutation(currentGym?.id || '');

    // Check-in Verification State
    const [isCheckInDrawerOpen, setIsCheckInDrawerOpen] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [checkInResult, setCheckInResult] = useState<{
        success: boolean;
        message: string;
        user?: string;
        phone?: string;
        plan?: string;
        expiryDate?: string;
        lastCheckIn?: string;
    } | null>(null);

    const handleVerifyCheckIn = async () => {
        if (!accessCode.trim() || !currentGym) return;

        checkInMutation.mutate(accessCode, {
            onSuccess: (res) => {
                const data = res.data.data || res.data;
                setCheckInResult({
                    success: true,
                    message: 'Check-in verified successfully!',
                    user: data.user?.name || 'Unknown User',
                    phone: data.user?.mobileNumber,
                    plan: data.subscription?.plan?.name,
                    expiryDate: data.subscription?.endDate,
                    lastCheckIn: data.lastCheckIn
                });
                setAccessCode('');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                const errorMsg = error.response?.data?.error || 'Verification failed. Please try again.';
                setCheckInResult({ success: false, message: errorMsg });
            }
        });
    };

    const resetCheckInState = (open: boolean) => {
        setIsCheckInDrawerOpen(open);
        if (!open) {
            setTimeout(() => {
                setCheckInResult(null);
                setAccessCode('');
            }, 300);
        }
    };

    const getExpiryInfo = (dateString?: string) => {
        if (!dateString) return { label: 'No Active Plan', color: 'text-zinc-400', bg: 'bg-zinc-100', expired: false };
        const date = new Date(dateString);
        const expired = isPast(date);
        const relative = formatDistanceToNow(date, { addSuffix: true });
        if (expired) return { label: `Expired ${relative}`, color: 'text-red-700', bg: 'bg-red-50', expired: true };
        return { label: `Expires ${relative}`, color: 'text-emerald-700', bg: 'bg-emerald-50', expired: false };
    };

    const showLoader = isGymLoading || (currentGym && statsLoading && !stats);

    if (showLoader) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        )
    }

    if (statsError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center">
                    <p className="font-semibold">Failed to load dashboard stats.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm underline hover:text-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const displayStats = stats || {
        totalRevenue: 0,
        activeMembers: 0,
        unsettledAmount: 0,
        recentActivity: [] as RecentItemProps[]
    };

    const hasUnsettledAmount = displayStats.unsettledAmount > 0;

    const recentActivityFormatted = displayStats.recentActivity.map((act) => ({
        ...act,
        time: act.time ? new Date(act.time).toLocaleDateString() : 'N/A',
        amount: act.amount ? `+ ₹${act.amount}` : undefined
    }));

    return (
        <div className="space-y-8 px-4 pb-12 bg-[#FAFAFA] min-h-screen">
            <OwnerHeader />

            {/* Layout Fix: Hero Card for Revenue + Grid for others */}
            <div className="space-y-4">
                <HeroRevenueCard
                    value={`₹${displayStats.totalRevenue.toLocaleString()}`}
                    change="12%"
                />

                <div className="grid grid-cols-2 gap-4">
                    <StatsCard
                        label="Active Members"
                        value={displayStats.activeMembers.toString()}
                        icon={<Users className="w-4 h-4" />}
                    />
                    <StatsCard
                        label="Unsettled"
                        value={`₹${displayStats.unsettledAmount.toLocaleString()}`}
                        // Dynamically change style if money is owed
                        variant={hasUnsettledAmount ? 'danger' : 'default'}
                        icon={<AlertCircle className="w-4 h-4" />}
                        change={hasUnsettledAmount ? "Collect now" : "All good"}
                        positive={!hasUnsettledAmount}
                    />
                </div>
            </div>

            <QuickActions
                onCheckInClick={() => setIsCheckInDrawerOpen(true)}
                onPaymentsClick={() => router.push('/owner/payments')}
            />

            <RecentActivityList items={recentActivityFormatted} />

            {/* Check-in Verification Drawer */}
            <Drawer open={isCheckInDrawerOpen} onOpenChange={resetCheckInState}>
                <DrawerContent className="max-w-md mx-auto rounded-t-[32px] max-h-[90vh]">
                    <div className="p-6 pb-2 bg-zinc-50/50">
                        <DrawerHeader className="p-0 text-left">
                            <DrawerTitle className="text-xl font-bold text-zinc-900">Member Check-in</DrawerTitle>
                            <DrawerDescription>
                                {checkInResult ? "Verification Result" : "Enter access code to verify membership"}
                            </DrawerDescription>
                        </DrawerHeader>
                    </div>

                    <div className="p-6 pt-2 space-y-6">
                        {!checkInResult ? (
                            <div className="space-y-6 mt-4">
                                <div className="space-y-3">
                                    <Label className="text-zinc-700 font-bold text-xs uppercase tracking-wider pl-1">Access Code</Label>
                                    <div className="relative">
                                        <Input
                                            value={accessCode}
                                            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                            className="h-16 rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 text-center text-3xl font-black tracking-[0.5em] uppercase placeholder:tracking-normal focus:border-zinc-900 focus:ring-0 transition-all text-zinc-900"
                                            placeholder="••••••"
                                            maxLength={8}
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-400 text-center">Ask member for their 6-digit dynamic code</p>
                                </div>
                                <Button
                                    onClick={handleVerifyCheckIn}
                                    disabled={checkInMutation.isPending || accessCode.length < 3}
                                    className="w-full h-14 text-base font-bold bg-zinc-900 hover:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200 active:scale-[0.98] transition-all"
                                >
                                    {checkInMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : 'Verify Access'}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative mb-6 mt-2">
                                    {checkInResult.success && (
                                        <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                    )}
                                    <div className={`h-20 w-20 rounded-full flex items-center justify-center border-4 border-white shadow-xl ${checkInResult.success ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                                        }`}>
                                        {checkInResult.success ? <CheckCircle2 className="w-10 h-10" strokeWidth={3} /> : <XCircle className="w-10 h-10" strokeWidth={3} />}
                                    </div>
                                </div>

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-zinc-900">
                                        {checkInResult.success ? 'Access Granted' : 'Access Denied'}
                                    </h3>
                                    <p className="text-zinc-500 text-sm mt-1 max-w-[200px] mx-auto leading-relaxed">
                                        {checkInResult.message}
                                    </p>
                                </div>

                                {checkInResult.user && checkInResult.success && (
                                    <div className="w-full bg-white rounded-[24px] border border-zinc-200 shadow-sm overflow-hidden relative">
                                        <div className="h-2 w-full bg-zinc-900" />
                                        <div className="p-5">
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-lg border-2 border-white shadow-sm">
                                                    {checkInResult.user.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-lg text-zinc-900 truncate">{checkInResult.user}</h4>
                                                    <div className="flex items-center gap-1.5 text-zinc-500">
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                        <p className="text-xs font-medium">{checkInResult.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full border-t-2 border-dashed border-zinc-100 mb-5 relative">
                                                <div className="absolute -left-[26px] -top-3 w-6 h-6 rounded-full bg-zinc-50 border-r border-zinc-200" />
                                                <div className="absolute -right-[26px] -top-3 w-6 h-6 rounded-full bg-zinc-50 border-l border-zinc-200" />
                                            </div>
                                            {checkInResult.plan && (
                                                <div className={`rounded-xl p-4 flex items-center justify-between ${getExpiryInfo(checkInResult.expiryDate).bg}`}>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">Active Plan</span>
                                                        <span className="font-bold text-zinc-800 text-sm">{checkInResult.plan}</span>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">Validity</span>
                                                        <div className={`flex items-center gap-1.5 ${getExpiryInfo(checkInResult.expiryDate).color}`}>
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            <span className="font-bold text-xs">{getExpiryInfo(checkInResult.expiryDate).label}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {checkInResult.lastCheckIn && (
                                                <div className="mt-4 pt-4 border-t border-zinc-100">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-zinc-500">Last Check-in</span>
                                                        <span className="text-xs font-bold text-zinc-900">
                                                            {formatDistanceToNow(new Date(checkInResult.lastCheckIn), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <Button
                                    onClick={() => { setCheckInResult(null); setAccessCode(''); }}
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl mt-6 font-semibold border-2 border-zinc-100 hover:bg-zinc-50 hover:text-zinc-900"
                                >
                                    Scan Another Member
                                </Button>
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}