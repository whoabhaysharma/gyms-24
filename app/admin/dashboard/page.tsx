'use client'

import { Users, Building2, Wallet, Activity, ArrowUpRight, ShieldCheck } from "lucide-react"
import { useAdminStatsQuery } from "@/lib/hooks/queries/useAdmin";
import { useUnsettledSummaryQuery } from "@/lib/hooks/queries/useSettlements";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

// ---------------------------------------
// Types
// ---------------------------------------
interface StatsCardProps {
  label: string
  value: string
  icon?: React.ReactNode
  className?: string
  variant?: 'default' | 'primary' | 'secondary'
}

// ---------------------------------------
// Header Component
// ---------------------------------------
function AdminHeader() {
  return (
    <header className={'bg-transparent pt-6 pb-2'}>
      <div className="flex items-center justify-between max-w-md mx-auto w-full relative">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
            AD
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">Admin Portal</p>
            <h1 className="text-xl font-extrabold text-zinc-900 leading-none tracking-tight">Dashboard</h1>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------
// Stats Components
// ---------------------------------------
function StatsCard({ label, value, icon, className, variant = 'default' }: StatsCardProps) {
  return (
    <div className={cn(
      "p-5 rounded-[24px] border transition-all duration-200 relative overflow-hidden group",
      variant === 'primary' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)]",
      className
    )}>
      {/* Background decoration */}
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-110",
        variant === 'primary' ? "bg-white" : "bg-zinc-900"
      )} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className={cn(
            "p-2 rounded-full w-fit",
            variant === 'primary' ? "bg-zinc-800 text-zinc-300" : "bg-zinc-50 text-zinc-500"
          )}>
            {icon}
          </div>
        </div>

        <div>
          <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", variant === 'primary' ? "text-zinc-400" : "text-zinc-400")}>
            {label}
          </p>
          <h3 className={cn("text-2xl font-black tracking-tight", variant === 'primary' ? "text-white" : "text-zinc-900")}>
            {value}
          </h3>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------
// Recent Activity List
// ---------------------------------------
function RecentActivityList({ items }: { items: { type: string, title: string, time: string }[] }) {
  if (items.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="font-bold text-zinc-800 text-lg mb-4 px-1">Recent Activity</h3>
        <div className="p-8 text-center bg-white rounded-[24px] border border-zinc-100 border-dashed">
          <p className="text-zinc-400 text-sm">No recent activity.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h3 className="font-bold text-zinc-800 text-lg mb-4 px-1">Recent Activity</h3>
      <div className="space-y-3 pb-32">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-50 shadow-sm hover:border-zinc-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border",
                item.type === 'GYM_CREATED' ? "bg-blue-50 border-blue-100 text-blue-500" : "bg-zinc-50 border-zinc-100 text-zinc-400"
              )}>
                {item.type === 'GYM_CREATED' ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-zinc-800 text-sm">{item.title}</p>
                <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-wide">
                  {item.type === 'GYM_CREATED' ? 'New Gym' : 'New User'}
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-zinc-400">
              {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------
// Main Dashboard Component
// ---------------------------------------
export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useAdminStatsQuery();
  const { data: unsettledSummary } = useUnsettledSummaryQuery();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    )
  }

  if (isError) {
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
    )
  }

  const displayStats = stats || {
    totalUsers: 0,
    totalGyms: 0,
    totalRevenue: 0,
    recentActivity: []
  };

  return (
    <div className="space-y-6 px-4 pb-12 bg-[#FAFAFA] min-h-screen max-w-md mx-auto">
      <AdminHeader />

      <div className="space-y-4">
        {/* Revenue Card (Primary) */}
        {/* Unsettled Amount Card (Primary) */}
        <StatsCard
          label="Total Unsettled"
          value={`₹${(unsettledSummary || []).reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString()}`}
          icon={<Wallet className="w-5 h-5" />}
          variant="primary"
        />

        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            label="Total Gyms"
            value={displayStats.totalGyms.toString()}
            icon={<Building2 className="w-4 h-4" />}
          />
          <StatsCard
            label="Total Users"
            value={displayStats.totalUsers.toString()}
            icon={<Users className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Quick Actions Placeholder */}
      <div className="bg-white p-6 rounded-[28px] shadow-sm border border-zinc-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-zinc-900">Quick Actions</h3>
          <ShieldCheck className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/admin/gyms')}
            className="flex flex-col items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 py-4 rounded-2xl transition-colors"
          >
            <Building2 className="w-5 h-5 text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-600">Verify Gyms</span>
          </button>
          <button
            onClick={() => router.push('/admin/users')}
            className="flex flex-col items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 py-4 rounded-2xl transition-colors"
          >
            <Users className="w-5 h-5 text-zinc-600" />
            <span className="text-xs font-semibold text-zinc-600">Manage Users</span>
          </button>
        </div>
      </div>

      <RecentActivityList items={displayStats.recentActivity} />
    </div>
  )
}