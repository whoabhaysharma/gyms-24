'use client';

import React, { useState, useEffect } from 'react';
import { Home, Building2, Users, Settings, IndianRupee } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function AdminFooter() {
    const router = useRouter();
    const currentPathname = usePathname();

    const [activeTab, setActiveTab] = useState(currentPathname);

    useEffect(() => {
        setActiveTab(currentPathname);
    }, [currentPathname]);

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Building2, label: 'Gyms', path: '/admin/gyms' },
        { icon: IndianRupee, label: 'Settlements', path: '/admin/settlements' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <nav className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl px-2 py-2 flex items-center justify-between gap-1 w-[90%] max-w-[360px]">
                {navItems.map((item) => {
                    const isActive = activeTab === item.path || activeTab?.startsWith(item.path);
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                setActiveTab(item.path);
                                router.push(item.path);
                            }}
                            className={`relative flex flex-col items-center justify-center h-14 w-14 rounded-xl transition-all duration-300 ${isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            {isActive && (
                                <span className="absolute inset-0 bg-zinc-100 rounded-xl -z-10 scale-100 transition-transform duration-300" />
                            )}

                            <item.icon
                                className={`w-6 h-6 transition-all duration-300 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-2 scale-100'
                                    }`}
                            />
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200">
            <main className="flex-1 w-full max-w-md mx-auto relative z-10 pb-24">
                {children}
            </main>
            <AdminFooter />
        </div>
    );
}
