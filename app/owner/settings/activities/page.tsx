'use client'

import { useState } from "react";
import { useOwnerStore } from "@/lib/store/ownerStore";
import { useAuditLogsQuery } from "@/lib/hooks/queries/useAuditLogs";
import {
    Loader2,
    ArrowLeft,
    Activity,
    User,
    ShieldAlert,
    Clock,
    ChevronRight,
    Search,
    Filter,
    Calendar,
    Database
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Helper to determine styles based on action type
const getActionStyle = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD')) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (act.includes('DELETE') || act.includes('REMOVE')) return "bg-rose-100 text-rose-700 border-rose-200";
    if (act.includes('UPDATE') || act.includes('EDIT')) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-zinc-100 text-zinc-700 border-zinc-200";
};

// Helper component to render details nicely
const DetailView = ({ details }: { details: any }) => {
    if (!details || Object.keys(details).length === 0) return null;

    // Convert generic object to array for mapping, filtering out complex nested objects if needed
    const items = Object.entries(details).slice(0, 4); // Limit to 4 items to keep UI clean

    return (
        <div className="mt-3 bg-zinc-50/80 rounded-xl p-3 border border-zinc-100/80 grid grid-cols-2 gap-2">
            {items.map(([key, value]) => (
                <div key={key} className="overflow-hidden">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">{key}</p>
                    <p className="text-xs text-zinc-700 font-medium truncate">
                        {typeof value === 'object' ? 'Object' : String(value)}
                    </p>
                </div>
            ))}
            {Object.keys(details).length > 4 && (
                <p className="col-span-2 text-[10px] text-zinc-400 text-center pt-1">
                    + {Object.keys(details).length - 4} more changes
                </p>
            )}
        </div>
    );
};

export default function ActivitiesPage() {
    const router = useRouter();
    const { currentGym } = useOwnerStore();
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading, isError } = useAuditLogsQuery({
        gymId: currentGym?.id,
        page,
        limit
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium text-zinc-400 animate-pulse">Loading timeline...</p>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 gap-6 px-4">
                <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center shadow-sm">
                    <ShieldAlert className="w-10 h-10 text-rose-500" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-zinc-900">Connection Issue</h3>
                    <p className="text-zinc-500 text-sm max-w-[250px]">We couldn't fetch the activity logs. Please check your connection.</p>
                </div>
                <Button className="rounded-full px-8 bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    const logs = Array.isArray(data) ? data : (data.data || []);
    const meta = !Array.isArray(data) ? data.meta : { total: 0, page: 1, limit: 20, totalPages: 0 };

    return (
        <div className="min-h-screen bg-[#F2F4F7] sm:bg-zinc-50 pb-20 font-sans selection:bg-indigo-100">
            {/* Modern Glass Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-zinc-100 -ml-2 w-10 h-10"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-900" />
                    </Button>
                    <span className="font-bold text-zinc-900">Activity Log</span>
                    <div className="w-10 flex justify-end">
                        {/* Placeholder for future filter action */}
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 text-zinc-400">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 space-y-8">

                {/* Hero / Summary Widget */}
                <div className="bg-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-200">
                                    <Activity className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Current Gym</p>
                                    <h2 className="font-bold text-zinc-900 text-sm">{currentGym?.name}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-zinc-50 rounded-2xl p-3 flex-1 border border-zinc-100">
                                <span className="block text-2xl font-bold text-zinc-900">{meta.total || logs.length}</span>
                                <span className="text-[11px] text-zinc-500 font-medium">Total Events</span>
                            </div>
                            <div className="bg-zinc-50 rounded-2xl p-3 flex-1 border border-zinc-100">
                                <span className="block text-2xl font-bold text-zinc-900">{page}</span>
                                <span className="text-[11px] text-zinc-500 font-medium">Current Page</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline Feed */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-sm font-bold text-zinc-900">Recent Updates</h3>
                        <span className="text-[10px] font-medium text-zinc-400 bg-white px-2 py-1 rounded-full border border-zinc-100 shadow-sm">
                            Real-time
                        </span>
                    </div>

                    {logs.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-10 text-center border border-zinc-100/50 shadow-sm">
                            <Database className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <p className="text-zinc-900 font-medium mb-1">No Data Found</p>
                            <p className="text-xs text-zinc-400">There are no activities recorded for this period.</p>
                        </div>
                    ) : (
                        <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[23px] before:w-[2px] before:bg-zinc-200/60 before:z-0">
                            {logs.map((log: any, index: number) => {
                                const actionStyle = getActionStyle(log.action);
                                return (
                                    <div key={log.id} className="relative z-10 group">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-0 top-1.5 w-[14px] h-[14px] bg-white border-[3px] border-zinc-200 rounded-full group-hover:border-indigo-400 transition-colors shadow-sm" />

                                        {/* Card Content */}
                                        <div className="ml-8 bg-white p-4 rounded-[1.5rem] border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge
                                                    variant="outline"
                                                    className={cn("rounded-full px-2.5 py-0.5 text-[10px] border-0 font-bold uppercase tracking-wider", actionStyle)}
                                                >
                                                    {log.action.replace(/_/g, ' ')}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                </div>
                                            </div>

                                            <p className="text-sm text-zinc-600 leading-snug mb-3">
                                                <span className="font-bold text-zinc-900">{log.actor?.name || 'System'}</span>
                                                {' '}modified{' '}
                                                <span className="font-medium text-zinc-900 underline decoration-zinc-200 decoration-1 underline-offset-2">{log.entity}</span>
                                            </p>

                                            <DetailView details={log.details} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Floating Pagination */}
                {meta.totalPages > 1 && (
                    <div className="sticky bottom-6 flex justify-center pb-2 z-30">
                        <div className="bg-zinc-900/90 backdrop-blur-md text-white px-2 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-zinc-700/50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-full w-8 h-8 hover:bg-white/10 hover:text-white disabled:opacity-30 text-zinc-300"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>

                            <span className="text-xs font-medium px-2 min-w-[3rem] text-center font-mono">
                                {page} / {meta.totalPages}
                            </span>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="rounded-full w-8 h-8 hover:bg-white/10 hover:text-white disabled:opacity-30 text-zinc-300"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}