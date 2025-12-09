'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check current status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Reload page when back online
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-foreground">No Connection</h1>
        <p className="text-muted-foreground mb-6">
          You&apos;re currently offline. Some features may be unavailable.
        </p>

        <div className="bg-muted p-4 rounded-lg mb-6 text-left">
          <h2 className="font-semibold mb-3 text-foreground">What you can do:</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ View previously loaded content</li>
            <li>✓ Browse offline pages</li>
            <li>✓ Check your bookmarks</li>
          </ul>
        </div>

        <Button
          onClick={() => window.location.href = '/'}
          className="w-full mb-3"
        >
          Go to Home
        </Button>

        <p className="text-xs text-muted-foreground">
          {isOnline ? (
            <span className="text-green-600">You&apos;re back online! Reloading...</span>
          ) : (
            <span>Waiting for connection...</span>
          )}
        </p>
      </div>
    </div>
  );
}
