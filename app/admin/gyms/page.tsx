'use client'

import { useState } from 'react';
import { useGymsQuery, useVerifyGymMutation, useUnverifyGymMutation } from '@/lib/hooks/queries/useGyms';
import {
    Loader2,
    ShieldCheck,
    ShieldAlert,
    MapPin,
    Store,
    Search,
    Clock,
    User,
    CalendarDays,
    Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function GymVerifyPage() {
    const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('unverified');
    const [search, setSearch] = useState('');

    const { data, isLoading } = useGymsQuery({
        verified: filter === 'all' ? undefined : filter === 'verified',
    });

    const verifyMutation = useVerifyGymMutation();
    const unverifyMutation = useUnverifyGymMutation();

    const gyms = data?.data || [];
    const filteredGyms = gyms.filter(gym =>
        gym.name.toLowerCase().includes(search.toLowerCase()) ||
        gym.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans selection:bg-zinc-900 selection:text-white">

            {/* --- Header --- */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 pt-safe-top">
                <div className="px-5 pt-4 pb-4">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-900/20">
                            <Store className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-zinc-900 leading-none">Gym Verification</h1>
                            <p className="text-xs text-zinc-500 mt-1 font-medium">
                                {isLoading ? "Syncing..." : `${filteredGyms.length} gyms found`}
                            </p>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="space-y-3">
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                                <Search className="w-4 h-4 text-zinc-400" />
                            </div>
                            <Input
                                placeholder="Search by name or address..."
                                className="pl-14 h-12 bg-white border-zinc-200 rounded-2xl shadow-sm text-sm focus-visible:ring-zinc-900 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                            {[
                                { id: 'unverified', label: 'Pending Request', icon: Clock },
                                { id: 'verified', label: 'Verified', icon: ShieldCheck },
                                { id: 'all', label: 'All Gyms', icon: Store }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id as any)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap",
                                        filter === item.id
                                            ? "bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-900/10"
                                            : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    <item.icon className="w-3.5 h-3.5" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Main List --- */}
            <main className="px-4 py-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                    </div>
                ) : filteredGyms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                            <Store className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="font-semibold text-zinc-900">No gyms found</h3>
                        <p className="text-sm text-zinc-500 mt-1">Check your search term or filters.</p>
                    </div>
                ) : (
                    filteredGyms.map((gym) => (
                        <div
                            key={gym.id}
                            className="group bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        >
                            <div className="p-5">
                                {/* Header: Name & Status */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="pr-4">
                                        <h3 className="font-bold text-lg text-zinc-900 leading-tight">{gym.name}</h3>
                                        <div className="flex items-start gap-1.5 mt-1.5 text-zinc-500">
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-zinc-400" />
                                            <p className="text-xs leading-relaxed line-clamp-2">{gym.address}</p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {gym.verified ? (
                                            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                                <ShieldCheck className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 animate-pulse">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Owner Info Section */}
                                <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-zinc-100">
                                            <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-bold">
                                                {gym.owner?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900">{gym.owner?.name || 'Unknown Owner'}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium bg-zinc-50 px-1.5 py-0.5 rounded-md">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{gym.owner?.mobileNumber || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                                                    <CalendarDays className="w-3 h-3" />
                                                    <span>{formatDistanceToNow(new Date(gym.createdAt))} ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="mt-4">
                                    {!gym.verified ? (
                                        <Button
                                            onClick={() => verifyMutation.mutate(gym.id)}
                                            disabled={verifyMutation.isPending}
                                            className="w-full h-11 rounded-xl font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/10 active:scale-[0.98] transition-all"
                                        >
                                            {verifyMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <ShieldCheck className="w-4 h-4 mr-2" />
                                            )}
                                            Approve Gym
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => unverifyMutation.mutate(gym.id)}
                                            disabled={unverifyMutation.isPending}
                                            variant="outline"
                                            className="w-full h-11 rounded-xl font-bold border-zinc-200 text-zinc-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 active:scale-[0.98] transition-all"
                                        >
                                            {unverifyMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <ShieldAlert className="w-4 h-4 mr-2" />
                                            )}
                                            Revoke Verification
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}