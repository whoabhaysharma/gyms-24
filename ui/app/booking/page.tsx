'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { toast } from 'sonner';
import {
    MapPin,
    Dumbbell,
    CreditCard,
    ChevronLeft,
    Check,
    Loader2,
    Building2,
    ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

// --- Types ---
interface Gym {
    id: string;
    name: string;
    address: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    durationValue: number;
    durationUnit: string;
    description: string;
}

export default function BookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

    // State
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'login' | 'select-gym' | 'select-plan' | 'success'>('login');
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedGym, setSelectedGym] = useState<string>('');
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [user, setUser] = useState<any>(null);

    // 1. Logic: Login & Auto-selection
    useEffect(() => {
        const login = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.post(`${API_URL}/auth/login-with-magic-link`, { token });
                const { token: sessionToken, user } = res.data.data;
                localStorage.setItem('token', sessionToken);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);

                // Check for pre-selected gym and plan
                const gymId = searchParams.get('gymId');
                const planId = searchParams.get('planId');

                if (gymId) {
                    setSelectedGym(gymId);
                    // Fetch plans for this gym
                    const plansRes = await axios.get(`${API_URL}/plans?gymId=${gymId}`, {
                        headers: { Authorization: `Bearer ${sessionToken}` }
                    });
                    const data = plansRes.data.data;
                    if (Array.isArray(data)) {
                        setPlans(data);
                    } else if (data && Array.isArray(data.data)) {
                        setPlans(data.data);
                    } else {
                        setPlans([]);
                    }

                    if (planId) {
                        setSelectedPlan(planId);
                        setStep('select-plan');
                        // Optional: Auto-scroll to payment or trigger it? 
                        // For now, let user confirm.
                    } else {
                        setStep('select-plan');
                    }
                } else {
                    setStep('select-gym');
                    fetchGyms(sessionToken);
                }
            } catch (error) {
                toast.error('Invalid Link', { description: 'This magic link has expired.' });
                setLoading(false);
            }
        };
        login();
    }, [token, searchParams]);

    // 2. Logic: Fetch Gyms
    const fetchGyms = async (authToken: string) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/gyms`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const data = res.data.data;
            if (Array.isArray(data)) {
                setGyms(data);
            } else if (data && Array.isArray(data.data)) {
                setGyms(data.data);
            } else {
                setGyms([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Logic: Fetch Plans
    const handleGymSelect = async (gymId: string) => {
        setSelectedGym(gymId);
        setLoading(true);
        try {
            const authToken = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/plans?gymId=${gymId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const data = res.data.data;
            if (Array.isArray(data)) {
                setPlans(data);
            } else if (data && Array.isArray(data.data)) {
                setPlans(data.data);
            } else {
                setPlans([]);
            }
            setStep('select-plan');
        } catch (error) {
            toast.error("Couldn't fetch plans");
        } finally {
            setLoading(false);
        }
    };

    // 4. Logic: Payment
    const handlePayment = async () => {
        if (!selectedGym || !selectedPlan) return;
        setIsProcessing(true);

        try {
            const authToken = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/subscriptions`, {
                gymId: selectedGym,
                planId: selectedPlan
            }, { headers: { Authorization: `Bearer ${authToken}` } });

            const { order } = res.data.data;
            const orderId = order.id;
            const plan = plans.find(p => p.id === selectedPlan);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: plan!.price * 100,
                currency: 'INR',
                name: 'Gym Access',
                description: `${plan!.name} Membership`,
                order_id: orderId,
                handler: async function (response: any) {
                    // Webhook handles verification.
                    setStep('success');
                    toast.success('Payment Successful', { description: 'Your membership is active!' });
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        toast('Payment Cancelled', { description: 'You cancelled the payment process.' });
                    }
                },
                prefill: {
                    name: user?.name,
                    contact: user?.mobileNumber,
                },
                notes: {
                    subscriptionId: res.data.data.subscription.id
                },
                theme: { color: '#000000' },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setIsProcessing(false);
                toast.error('Payment Failed', { description: response.error.description });
            });
            rzp.open();
        } catch (error) {
            toast.error('Payment Error');
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Views ---

    if (loading && step === 'login') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!token && step === 'login') {
        return (
            <div className="flex h-screen items-center justify-center p-6 bg-gray-50">
                <div className="w-full max-w-sm text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Link Expired</h2>
                    <p className="mt-1 text-sm text-gray-500">Please request a new login link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-900">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Sticky Header */}
            <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 px-4 py-3 backdrop-blur-md">
                <div className="mx-auto flex max-w-lg items-center justify-between">
                    {step === 'select-plan' ? (
                        <button
                            onClick={() => {
                                setStep('select-gym');
                                setSelectedGym('');
                                setPlans([]);
                            }}
                            className="-ml-2 rounded-full p-2 text-gray-500 active:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    ) : (
                        <div className="w-10" />
                    )}

                    <span className="text-base font-semibold">
                        {step === 'select-gym' ? 'Select Location' : 'Choose Plan'}
                    </span>
                    <div className="w-10" />
                </div>
            </header>

            <main className="mx-auto max-w-lg p-4">

                {/* Step 1: Select Gym */}
                {step === 'select-gym' && (
                    <div className="space-y-3">
                        <div className="mb-4 px-1">
                            <h1 className="text-2xl font-bold tracking-tight">Gyms nearby</h1>
                            <p className="text-sm text-gray-500">Select a location to continue</p>
                        </div>

                        {loading ? (
                            // Skeleton Loader
                            [1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 animate-pulse">
                                    <div className="h-12 w-12 rounded-xl bg-gray-100" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-1/2 bg-gray-100 rounded" />
                                        <div className="h-3 w-3/4 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Gym List
                            gyms.map((gym) => (
                                <button
                                    key={gym.id}
                                    onClick={() => handleGymSelect(gym.id)}
                                    className="group flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm border border-gray-100 transition-all active:scale-[0.98] active:bg-gray-50"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900">{gym.name}</h3>
                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                            <MapPin className="mr-1 h-3 w-3" />
                                            <span className="truncate">{gym.address}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}

                {/* Step 2: Select Plan */}
                {step === 'select-plan' && (
                    <div className="space-y-4">
                        <div className="mb-4 px-1">
                            <h1 className="text-2xl font-bold tracking-tight">Membership</h1>
                            <p className="text-sm text-gray-500">Choose a plan that fits your goals</p>
                        </div>

                        {loading ? (
                            [1, 2].map((i) => (
                                <div key={i} className="h-32 rounded-3xl bg-white animate-pulse" />
                            ))
                        ) : (
                            plans.map((plan) => {
                                const isSelected = selectedPlan === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={cn(
                                            "relative w-full rounded-3xl p-6 text-left transition-all duration-200 active:scale-[0.98] border",
                                            isSelected
                                                ? "bg-black text-white shadow-xl border-black"
                                                : "bg-white text-gray-900 shadow-sm border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                                <p className={cn("text-sm mt-1", isSelected ? "text-gray-400" : "text-gray-500")}>
                                                    {plan.durationValue} {plan.durationUnit} access
                                                </p>
                                            </div>
                                            {isSelected && <div className="bg-white/20 p-1 rounded-full"><Check className="h-4 w-4 text-white" /></div>}
                                        </div>

                                        <div className="mt-6 flex items-baseline gap-1">
                                            <span className="text-3xl font-bold tracking-tight">₹{plan.price}</span>
                                        </div>

                                        {plan.description && (
                                            <p className={cn("mt-2 text-sm line-clamp-2", isSelected ? "text-gray-400" : "text-gray-500")}>
                                                {plan.description}
                                            </p>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </main>

            {/* Floating Bottom Bar (iOS Style) */}
            {step === 'select-plan' && selectedPlan && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 px-4 py-4 backdrop-blur-xl border-t border-gray-100 pb-8 safe-area-bottom">
                    <div className="mx-auto max-w-lg">
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="flex w-full h-14 items-center justify-center gap-2 rounded-2xl bg-black text-lg font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Pay Securely <CreditCard className="h-5 w-5 opacity-80" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
                <div className="flex h-screen flex-col items-center justify-center bg-white p-6 text-center">
                    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500">
                        <Check className="h-12 w-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">You're In! 🎉</h1>
                    <p className="mt-2 text-gray-500 max-w-xs mx-auto">
                        Your membership has been activated successfully. Get ready to crush your goals!
                    </p>
                    <div className="mt-8 w-full max-w-xs space-y-3">
                        <button
                            onClick={() => router.push('/user/dashboard')}
                            className="w-full rounded-2xl bg-black py-4 text-lg font-bold text-white shadow-lg active:scale-[0.98] transition-transform"
                        >
                            Go to Dashboard
                        </button>
                        <p className="text-xs text-gray-400">
                            You can check your access code in the dashboard.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}