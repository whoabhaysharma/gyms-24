"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export default function VerifyOtpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Spinner className="w-8 h-8 text-zinc-400" />
    </div>
  );
}
