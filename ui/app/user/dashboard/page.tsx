'use client';

import { useEffect, useState } from 'react';
import { Bell, User, QrCode, MapPin, Calendar, ArrowRight, Loader2, Activity, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { usersAPI, subscriptionsAPI, attendanceAPI } from '@/lib/api/client';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// --- Types ---
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  accessCode?: string;
  plan: {
    name: string;
    price: number;
  };
  gym: {
    id: string;
    name: string;
    address?: string;
  };
}

interface AttendanceLog {
  id: string;
  checkIn: string;
  checkOut?: string;
  gym: {
    name: string;
  };
}

// --- Components ---

function UserHeader({ user }: { user: UserProfile | null }) {
  return (
    <header className="bg-transparent pt-6 pb-2 px-1">
      <div className="flex items-center justify-between max-w-md mx-auto w-full relative">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer transition-transform active:scale-95">
            <div className="h-12 w-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-md ring-2 ring-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">Welcome Back</p>
            <h1 className="text-xl font-extrabold text-zinc-900 leading-none tracking-tight">{user?.name || 'User'}</h1>
          </div>
        </div>
        <button className="p-2.5 rounded-full bg-white text-zinc-600 shadow-sm border border-zinc-100 hover:bg-zinc-50 transition-transform active:scale-95 relative outline-none focus:ring-2 focus:ring-zinc-200">
          <Bell className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}

function SubscriptionCard({ sub }: { sub: Subscription }) {
  return (
    <div className="group bg-zinc-900 text-white p-6 rounded-[32px] shadow-xl shadow-zinc-200 relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-zinc-300/50">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-zinc-800 rounded-full -mr-12 -mt-12 blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full -ml-10 -mb-10 blur-3xl opacity-30"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-xl tracking-tight">{sub.gym.name}</h3>
            </div>
            <p className="text-zinc-400 text-xs font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {sub.gym.address || 'Main Branch'}
            </p>
          </div>
          <Badge className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide">
            {sub.plan.name}
          </Badge>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex items-center justify-between border border-white/5 mb-6 group-hover:bg-white/15 transition-colors">
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-1.5">Access Code</p>
            <p className="text-3xl font-mono font-black tracking-widest text-white">{sub.accessCode || '----'}</p>
          </div>
          <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-3 transition-transform">
            <QrCode className="w-7 h-7 text-zinc-900" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-800/50 px-3 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5" />
            <span>Expires {format(new Date(sub.endDate), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-green-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentActivityItem({ log }: { log: AttendanceLog }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-zinc-100 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-zinc-50 text-zinc-900 flex items-center justify-center border border-zinc-100">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-zinc-900 text-sm mb-0.5">Checked In</p>
          <p className="text-zinc-400 text-xs font-medium">{log.gym.name}</p>
        </div>
      </div>
      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100">
        {formatDistanceToNow(new Date(log.checkIn), { addSuffix: true })}
      </span>
    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [recentLogs, setRecentLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Profile
        const userRes = await usersAPI.getMe();
        setUser(userRes.data.data || userRes.data);

        // 2. Fetch Active Subscriptions
        const subsRes = await subscriptionsAPI.getMySubscriptions();
        const subs = subsRes.data.data || subsRes.data;
        // Find first active subscription for the card
        const active = subs.find((s: Subscription) => s.status === 'ACTIVE');
        setActiveSub(active || null);

        // 3. Fetch Recent Attendance
        const attendanceRes = await attendanceAPI.getMe();
        const logs = attendanceRes.data.data || attendanceRes.data;
        setRecentLogs(logs.slice(0, 5)); // Take top 5

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-24 bg-[#FAFAFA] min-h-screen">
      <UserHeader user={user} />

      {/* Active Subscription Card */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeSub ? (
          <SubscriptionCard sub={activeSub} />
        ) : (
          <div className="bg-zinc-900 text-white p-8 rounded-[32px] shadow-xl shadow-zinc-200 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-zinc-700">
                <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">No Active Plan</h3>
              <p className="text-zinc-400 text-sm mb-8 max-w-[200px] mx-auto leading-relaxed">Start your fitness journey today by finding a gym near you.</p>
              <Button
                onClick={() => router.push('/user/explore')}
                className="bg-white text-zinc-900 hover:bg-zinc-100 font-bold rounded-xl px-8 h-12 w-full shadow-lg shadow-zinc-900/20"
              >
                Explore Gyms
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-bold text-zinc-900 text-lg mb-4 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/user/explore')}
            className="group bg-white p-5 rounded-[24px] border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-zinc-700 group-hover:text-zinc-900">Find Gyms</span>
          </button>
          <button className="group bg-white p-5 rounded-[24px] border border-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-zinc-700 group-hover:text-zinc-900">My Stats</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-zinc-900 text-lg">Recent Activity</h3>
          <button className="text-xs font-bold text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3 pb-8">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <RecentActivityItem key={log.id} log={log} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-[24px] border border-zinc-100 border-dashed">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-zinc-300" />
              </div>
              <p className="text-zinc-400 text-sm font-medium">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}