"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { Spinner } from "@/components/ui/spinner";

const PUBLIC_PATHS = ["/auth/login", "/auth/verify-otp", "/booking"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, token, isHydrated } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait for store hydration to complete
        if (!isHydrated) return;

        const checkAuth = () => {
            const isAuthenticated = !!(user && token);
            const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
            const isRoot = pathname === "/";

            if (isAuthenticated) {
                // If logged in and trying to access public auth pages, redirect to dashboard
                if (isPublicPath || isRoot) {
                    const { getDashboardPath } = useAuthStore.getState();
                    router.replace(getDashboardPath());
                    return;
                }
            } else {
                // If not logged in and trying to access private pages or root, redirect to login
                if (!isPublicPath) {
                    router.replace("/auth/login");
                    return;
                }
            }

            setIsChecking(false);
        };

        checkAuth();
    }, [pathname, user, token, router, isHydrated]);

    // Show loading spinner while checking auth state to prevent flash of content
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    return <>{children}</>;
}
