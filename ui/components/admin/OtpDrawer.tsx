'use client';

import React, { useState } from 'react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminAPI } from '@/lib/api/client';
import { toast } from 'sonner';
import { KeyRound, Loader2, Copy, Smartphone, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OtpDrawer({ trigger }: { trigger?: React.ReactNode }) {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGetOtp = async () => {
        if (!mobile || mobile.length < 10) {
            toast.error('Please enter a valid mobile number');
            return;
        }

        setLoading(true);
        setOtp(null);
        setCopied(false);

        try {
            const response = await adminAPI.getOtp(mobile);
            const data = response.data;

            if (data.success) {
                if (data.data.otp) {
                    setOtp(data.data.otp);
                    toast.success('OTP fetched successfully');
                } else {
                    toast.info(data.data.message || 'No active OTP found');
                }
            } else {
                toast.error(data.message || 'Failed to fetch OTP');
            }
        } catch (error: any) {
            console.error('Error fetching OTP:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch OTP');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (otp) {
            navigator.clipboard.writeText(otp);
            setCopied(true);
            toast.success('OTP copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-xl bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:scale-105 transition-all duration-300 z-50"
                    >
                        <KeyRound className="h-6 w-6" />
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="bg-zinc-50/95 backdrop-blur-xl">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader className="text-center pt-8 pb-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4 shadow-sm border border-zinc-200">
                            <KeyRound className="w-6 h-6 text-zinc-900" />
                        </div>
                        <DrawerTitle className="text-2xl font-bold text-zinc-900">Get User OTP</DrawerTitle>
                        <DrawerDescription className="text-zinc-500 mt-1">
                            Retrieve the active OTP for any user instantly.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="mobile" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                Mobile Number
                            </Label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    id="mobile"
                                    placeholder="Enter 10-digit number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    type="tel"
                                    maxLength={10}
                                    className="pl-10 h-12 bg-white border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900/10 rounded-xl text-lg tracking-wide"
                                />
                            </div>
                        </div>

                        {otp && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative overflow-hidden bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 text-center group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-transparent opacity-50" />

                                    <p className="relative text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                                        Active OTP Code
                                    </p>

                                    <div className="relative flex items-center justify-center gap-1 mb-4">
                                        {otp.split('').map((digit, i) => (
                                            <span
                                                key={i}
                                                className="w-10 h-12 flex items-center justify-center text-2xl font-bold bg-zinc-50 rounded-lg border border-zinc-100 text-zinc-900 shadow-sm"
                                            >
                                                {digit}
                                            </span>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyToClipboard}
                                        className={cn(
                                            "relative w-full transition-all duration-300",
                                            copied ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700" : "hover:bg-zinc-50"
                                        )}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCheck className="mr-2 h-4 w-4" />
                                                Copied to Clipboard
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy Code
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <DrawerFooter className="px-6 pb-8 pt-2">
                        <Button
                            onClick={handleGetOtp}
                            disabled={loading}
                            className="h-12 text-base font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/20 transition-all active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Fetching OTP...
                                </>
                            ) : (
                                'Get OTP'
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="h-12 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100">
                                Cancel
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
