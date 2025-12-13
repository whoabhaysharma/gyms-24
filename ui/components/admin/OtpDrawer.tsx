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
import { KeyRound, Loader2, Copy } from 'lucide-react';

export function OtpDrawer() {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleGetOtp = async () => {
        if (!mobile || mobile.length < 10) {
            toast.error('Please enter a valid mobile number');
            return;
        }

        setLoading(true);
        setOtp(null);

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
            toast.success('OTP copied to clipboard');
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed bottom-24 right-4 h-12 w-12 rounded-full shadow-lg bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 z-50"
                >
                    <KeyRound className="h-6 w-6" />
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Get User OTP</DrawerTitle>
                        <DrawerDescription>
                            Enter the mobile number to retrieve the active OTP.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                placeholder="Enter 10-digit number"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                type="tel"
                                maxLength={10}
                            />
                        </div>

                        {otp && (
                            <div className="flex items-center justify-between p-4 bg-zinc-100 rounded-lg border border-zinc-200">
                                <div>
                                    <p className="text-xs text-zinc-500 font-medium uppercase">Active OTP</p>
                                    <p className="text-2xl font-bold tracking-widest text-zinc-900">{otp}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                                    <Copy className="h-4 w-4 text-zinc-500" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <DrawerFooter>
                        <Button onClick={handleGetOtp} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Fetching...
                                </>
                            ) : (
                                'Get OTP'
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
