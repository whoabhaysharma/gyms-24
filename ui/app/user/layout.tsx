'use client';

import React, { useState, useEffect } from 'react';
import { Home, Compass, Activity, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

// --- Modern Floating Footer Component ---
export function UserFooter() {
    const router = useRouter();
    const currentPathname = usePathname();

    const [activeTab, setActiveTab] = useState(currentPathname);

    useEffect(() => {
        setActiveTab(currentPathname);
    }, [currentPathname]);

    const navItems = [
        { icon: Home, label: 'Home', path: '/user/dashboard' },
        { icon: Activity, label: 'Subscriptions', path: '/user/subscriptions' },
        { icon: Compass, label: 'Explore', path: '/user/explore' },
        { icon: Settings, label: 'Settings', path: '/user/settings' },
    ];

    // Hide footer on gym details page
    if (currentPathname?.startsWith('/user/gyms/')) {
        return null;
    }

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <nav className="pointer-events-auto bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-zinc-900/20 rounded-[24px] px-2 py-2 flex items-center justify-between gap-1 w-[90%] max-w-[340px]">
                {navItems.map((item) => {
                    const isActive = activeTab === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                setActiveTab(item.path);
                                router.push(item.path);
                            }}
                            className={`relative flex flex-col items-center justify-center h-12 w-12 rounded-2xl transition-all duration-300 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            {isActive && (
                                <span className="absolute inset-0 bg-white/10 rounded-2xl -z-10 scale-100 transition-transform duration-300" />
                            )}

                            <item.icon
                                className={`w-5 h-5 transition-all duration-300 ${isActive ? 'stroke-[2.5px] scale-110' : 'stroke-2 scale-100'
                                    }`}
                            />
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

// --- Main Layout Wrapper ---
export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-zinc-200">
            <main className="flex-1 w-full max-w-md mx-auto relative z-10 pb-24">
                {children}
            </main>
            <UserFooter />
        </div>
    );
}
