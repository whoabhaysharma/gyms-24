"use client";

import { Spinner } from "@/components/ui/spinner";

export default function HomePage() {
    // AuthGuard will handle the redirection.
    // If authenticated -> dashboard
    // If unauthenticated -> login (because / is not in PUBLIC_PATHS? Wait, let's check AuthGuard)

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Spinner className="h-12 w-12 mx-auto" />
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}
