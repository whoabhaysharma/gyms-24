"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Phone, ShieldCheck, ArrowLeft } from 'lucide-react';
import Lottie from 'lottie-react';
import lottieData from './lifestyle_of_when_weighing_gym.json';
import { authAPI } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from "sonner";

export default function LoginPage() {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  // Auto-focus input on step change could be nice, but let's keep it simple for mobile (avoid keyboard jumping)

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Basic validation
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.sendOtp(phoneNumber);
      toast.success(`OTP sent to ${phoneNumber}`);
      setStep('OTP');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to send OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!otp || otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    const otpNumber = parseInt(otp, 10);
    if (isNaN(otpNumber)) {
      toast.error('Invalid OTP format.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.verifyOtp(phoneNumber, otpNumber);
      const { user: userData, token: jwtToken } = response.data.data;

      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('authToken', jwtToken);

      setUser(userData);
      setToken(jwtToken);

      toast.success('Welcome back!');

      const { getDashboardPath } = useAuthStore.getState();
      router.push(getDashboardPath());
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to verify OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('PHONE');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* Top Section: Branding & Animation */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-zinc-50 rounded-b-[3rem] overflow-hidden pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 to-zinc-100/50" />

        {/* Lottie Container */}
        <div className="w-full max-w-sm relative z-10 px-6">
          <Lottie animationData={lottieData} loop={true} className="w-full h-auto" />
        </div>

        {/* Brand Name */}
        <div className="text-center relative z-10 mt-[-20px]">
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900">
            Gyms<span className="text-emerald-600">24</span>
          </h1>
          <p className="text-zinc-400 text-sm font-medium mt-1">Fitness anytime, anywhere.</p>
        </div>
      </div>

      {/* Bottom Section: Form */}
      <div className="flex-shrink-0 p-6 sm:p-8 w-full max-w-md mx-auto">
        <div className="space-y-6">

          {/* Header Text */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-zinc-900">
              {step === 'PHONE' ? 'Get Started' : 'Verify OTP'}
            </h2>
            <p className="text-zinc-500 text-sm">
              {step === 'PHONE'
                ? 'Enter your mobile number to continue'
                : `Enter the code sent to +91 ${phoneNumber}`
              }
            </p>
          </div>

          {/* Form Inputs */}
          <form onSubmit={step === 'PHONE' ? handleSendOtp : handleVerifyOtp} className="space-y-4">

            {step === 'PHONE' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhoneNumber(val);
                    }}
                    placeholder="Mobile Number"
                    className="pl-12 h-14 text-lg bg-zinc-50 border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                    maxLength={10}
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || phoneNumber.length < 10}
                  className="w-full h-14 text-base font-bold rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Continue <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 6) setOtp(val);
                    }}
                    placeholder="Enter 6-digit OTP"
                    className="pl-12 h-14 text-lg bg-zinc-50 border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="col-span-1 h-14 rounded-2xl border-zinc-200 hover:bg-zinc-50"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="col-span-3 h-14 text-base font-bold rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200 disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="text-xs font-semibold text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="pt-4 text-center">
            <p className="text-[10px] text-zinc-300 font-medium">
              By continuing, you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
