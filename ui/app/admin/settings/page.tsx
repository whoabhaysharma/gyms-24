'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Loader2, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { usersAPI } from '@/lib/api/client';

interface UserProfile {
    id: string;
    name: string;
    email?: string;
    roles: string[];
}

export default function AdminSettingsPage() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await usersAPI.getMe();
                setUser(res.data.data || res.data);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
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
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Settings</h1>
                <p className="text-zinc-500 text-sm font-medium">Admin controls and preferences</p>
            </div>

            <div className="px-4 space-y-6">
                {/* Profile Card */}
                <div className="bg-white p-5 rounded-[24px] border border-zinc-100 shadow-sm flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-zinc-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                        <AvatarFallback className="bg-zinc-900 text-white font-bold text-lg">
                            {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">{user?.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white uppercase tracking-wide">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-[24px] border border-zinc-100 overflow-hidden shadow-sm">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full h-14 flex items-center justify-between px-6 hover:bg-rose-50 hover:text-rose-600 group"
                    >
                        <div className="flex items-center gap-3 font-semibold text-zinc-700 group-hover:text-rose-600">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </div>
                    </Button>
                </div>

                <div className="text-center pt-4">
                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">FitGym Admin v1.0.0</p>
                </div>
            </div>
        </div>
    );
}
