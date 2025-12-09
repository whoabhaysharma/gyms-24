'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, LucideIconName } from '@/components/icons';
import React from 'react';

import { useAuthStore } from '@/lib/store/authStore';

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const USER_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/user/dashboard', icon: 'Home' },
  { label: 'Explore', href: '/user/explore', icon: 'Compass' },
  { label: 'Notifications', href: '/user/notifications', icon: 'Bell' },
  { label: 'Settings', href: '/user/settings', icon: 'Settings' },
];

const OWNER_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/owner/dashboard', icon: 'LayoutDashboard' },
  { label: 'Members', href: '/owner/members', icon: 'Users' },
  { label: 'Plans', href: '/owner/plans', icon: 'CreditCard' },
  { label: 'Checkin', href: '/owner/checkin', icon: 'ScanLine' },
  { label: 'More', href: '/owner/more', icon: 'Menu' },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Users', href: '/admin/users', icon: 'Users' },
  { label: 'Gyms', href: '/admin/gyms', icon: 'Dumbbell' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isHydrated } = useAuthStore();

  // Hide bottom nav on auth pages or if not hydrated yet
  if (pathname?.startsWith('/auth') || !isHydrated) {
    return null;
  }

  // Determine which nav items to show based on role
  let navItems = USER_NAV_ITEMS;

  if (user) {
    const roles = user.roles || [];
    if (roles.includes('ADMIN')) {
      navItems = ADMIN_NAV_ITEMS;
    } else if (roles.includes('OWNER')) {
      navItems = OWNER_NAV_ITEMS;
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-around items-stretch">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-4 px-4 flex-1 transition-colors ${isActive
                    ? 'text-black dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <Icon
                  name={item.icon as LucideIconName}
                  className="w-6 h-6 mb-1"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-xs font-medium">{item.label}</span>

                {/* Active indicator line at bottom */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
