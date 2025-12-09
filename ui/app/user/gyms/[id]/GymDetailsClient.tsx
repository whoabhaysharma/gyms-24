'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gymsAPI, plansAPI, subscriptionsAPI } from '@/lib/api/client';
import { Loader2, MapPin, Star, Check, CreditCard, ChevronLeft, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Script from 'next/script';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/authStore';

interface Gym {
    id: string;
    name: string;
    address?: string;
    description?: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    durationValue: number;
    durationUnit: string;
    description?: string;
}

export default function GymDetailsClient() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    // Safely handle params.id which could be string or string[]
    const gymId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [gym, setGym] = useState<Gym | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!gymId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch Gym Details
                const gymRes = await gymsAPI.getById(gymId);
                setGym(gymRes.data.data || gymRes.data);

                // Fetch Plans
                const plansRes = await plansAPI.getActiveByGymId(gymId);
                const plansData = plansRes.data.data || plansRes.data;
                if (Array.isArray(plansData)) {
                    setPlans(plansData);
                } else if (plansData && Array.isArray(plansData.data)) {
                    setPlans(plansData.data);
                } else {
                    setPlans([]);
                }
            } catch (error) {
                console.error('Failed to fetch gym details:', error);
                toast.error('Failed to load gym details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gymId]);

    const handlePayment = async () => {
        if (!selectedPlan || !gym) return;
        setIsProcessing(true);

        try {
            // 1. Create Subscription & Order
            const res = await subscriptionsAPI.create({
                gymId: gym.id,
                planId: selectedPlan
            });

            const { order, subscription } = res.data.data;
            const plan = plans.find(p => p.id === selectedPlan);

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: plan!.price * 100,
                currency: 'INR',
                name: 'Gym Access',
                description: `${plan!.name} Membership at ${gym.name}`,
                order_id: order.id,
                handler: async function (response: any) {
                    // Success
                    toast.success('Payment Successful', { description: 'Your membership is active!' });
                    router.push('/user/subscriptions');
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
                    subscriptionId: subscription.id
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
            console.error('Payment error:', error);
            toast.error('Payment Error', { description: 'Failed to initiate payment. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (!gym) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] p-4 text-center">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                    <Dumbbell className="w-8 h-8 text-zinc-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900">Gym Not Found</h2>
                <p className="text-zinc-500 text-sm mt-2 mb-6">The gym you are looking for does not exist or has been removed.</p>
                <Button onClick={() => router.back()} variant="outline">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-32">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Hero Section */}
            <div className="relative h-64 bg-zinc-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                {/* Placeholder Pattern */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent pt-20">
                    <h1 className="text-3xl font-black tracking-tight mb-2">{gym.name}</h1>
                    <div className="flex items-center gap-4 text-sm font-medium text-zinc-300">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">{gym.address || 'Location not available'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            <span className="text-white">4.8</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 space-y-8">
                {/* About Section */}
                <div>
                    <h2 className="text-lg font-bold text-zinc-900 mb-2">About</h2>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        {gym.description || "Experience top-tier fitness at this premium facility. Equipped with modern machines, free weights, and expert trainers to help you achieve your goals."}
                    </p>
                </div>

                {/* Plans Section */}
                <div>
                    <h2 className="text-lg font-bold text-zinc-900 mb-4">Membership Plans</h2>
                    <div className="space-y-3">
                        {plans.length > 0 ? (
                            plans.map((plan) => {
                                const isSelected = selectedPlan === plan.id;
                                return (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id)}
                                        className={cn(
                                            "w-full text-left p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden group",
                                            isSelected
                                                ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/20"
                                                : "bg-white text-zinc-900 border-zinc-100 shadow-sm hover:border-zinc-200"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                                <p className={cn("text-xs font-medium mt-1", isSelected ? "text-zinc-400" : "text-zinc-500")}>
                                                    {plan.durationValue} {plan.durationUnit} Access
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                isSelected ? "border-white bg-white" : "border-zinc-200"
                                            )}>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 stroke-[3px]" />}
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black tracking-tight">₹{plan.price}</span>
                                            <span className={cn("text-xs font-medium", isSelected ? "text-zinc-400" : "text-zinc-500")}>/ {plan.durationUnit.toLowerCase()}</span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-zinc-200">
                                <p className="text-zinc-400 text-sm font-medium">No plans available at the moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100 z-40 safe-area-bottom">
                <div className="max-w-md mx-auto">
                    <Button
                        onClick={handlePayment}
                        disabled={!selectedPlan || isProcessing}
                        className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg shadow-lg shadow-zinc-900/20 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Pay Securely <CreditCard className="ml-2 h-5 w-5 opacity-80" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
