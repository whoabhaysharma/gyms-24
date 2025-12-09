'use client';

import React, { useState, useEffect } from 'react';
import { Home, User, Settings, IndianRupee } from 'lucide-react';

// 🛑 FIX: Use real Next.js navigation hooks instead of mock functions
import { usePathname, useRouter } from 'next/navigation';
// Note: Ensure you are running this within a Next.js App Router environment 
// where 'next/navigation' is available.

// --- 2. Modern Floating Footer Component ---
export function OwnerFooter() {
  const router = useRouter();
  const currentPathname = usePathname(); // Get the actual current path

  // 1. Initialize activeTab with the current URL pathname
  const [activeTab, setActiveTab] = useState(currentPathname);

  // 2. Add useEffect to synchronize activeTab if the URL changes 
  //    (e.g., from an external link or a back button press)
  useEffect(() => {
    setActiveTab(currentPathname);
  }, [currentPathname]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/owner/dashboard' },
    { icon: User, label: 'Members', path: '/owner/members' }, // Changed label for clarity
    { icon: IndianRupee, label: 'Payments', path: '/owner/payments' },
    { icon: Settings, label: 'Profile', path: '/owner/settings' },
  ];

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl px-2 py-2 flex items-center justify-between gap-1 w-[90%] max-w-[360px]">
        {navItems.map((item) => {
          // Use the synchronized activeTab for comparison
          const isActive = activeTab === item.path;
          return (
            <button
              key={item.label}
              onClick={() => {
                // 3. Update state *before* navigation for immediate visual feedback
                setActiveTab(item.path);
                // 4. Use the real router.push() to perform navigation
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


// --- 4. Main Layout Wrapper (Unchanged) ---
import { useOwnerStore } from '@/lib/store/ownerStore';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { fetchGyms } = useOwnerStore();

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-zinc-200">
      <main className="flex-1 w-full max-w-md mx-auto relative z-10">
        {children}
      </main>
      <OwnerFooter />
    </div>
  );
}