'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { plansAPI } from "@/lib/api/client"
import { useOwnerStore } from "@/lib/store/ownerStore"
import {
    Dumbbell,
    Plus,
    MoreHorizontal,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    Banknote,
    CalendarDays,
    Loader2
} from "lucide-react"

// SHADCN / UI Imports
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
// ---------------------------------------
// Types (Based on your Prisma Schema)
// ---------------------------------------
enum PlanType {
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR"
}

interface GymSubscriptionPlan {
    id: string
    name: string
    description?: string
    durationValue: number
    durationUnit: PlanType
    price: number
    isActive: boolean
}

// ---------------------------------------
// Helper: Format Duration (e.g., 1 MONTH -> 1 Month, 3 MONTH -> 3 Months)
// ---------------------------------------
const formatDuration = (value: number, unit: PlanType) => {
    const unitString = unit.toLowerCase();
    // Pluralize if value > 1 (e.g., "Month" vs "Months")
    const label = value > 1 ? `${unitString}s` : unitString;
    // Capitalize first letter
    return `${value} ${label.charAt(0).toUpperCase() + label.slice(1)}`;
}

// ---------------------------------------
// Helper: Extract Plans from Response
// ---------------------------------------
const extractPlansFromResponse = (response: any): GymSubscriptionPlan[] => {
    const body = response.data || response;
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body?.data?.data)) return body.data.data;
    return [];
}

// ---------------------------------------
// Component: Plan Item Card
// ---------------------------------------
function PlanItem({ plan, onToggleStatus, onDelete }: {
    plan: GymSubscriptionPlan,
    onToggleStatus: (p: GymSubscriptionPlan) => void,
    onDelete: (id: string) => void
}) {
    return (
        <div className={`
            group relative flex flex-col p-4 bg-white border rounded-2xl shadow-sm transition-all duration-200
            ${plan.isActive
                ? 'border-zinc-100 hover:border-zinc-200 opacity-100'
                : 'border-zinc-100 bg-zinc-50/50 opacity-70'}
        `}>

            {/* Top Row: Name, Price, Menu */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-3">
                    {/* Icon Box */}
                    <div className={`
                        h-10 w-10 rounded-xl flex items-center justify-center border
                        ${plan.isActive ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-300'}
                    `}>
                        <Dumbbell className="w-5 h-5" />
                    </div>

                    <div>
                        <h3 className="font-bold text-zinc-900 text-base leading-tight">{plan.name}</h3>
                        <p className="text-xs text-zinc-500 font-medium mt-1">
                            {formatDuration(plan.durationValue, plan.durationUnit)} Access
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Price Tag */}
                    <div className="text-right mr-2">
                        <span className="block font-bold text-lg text-zinc-900 leading-none">₹{plan.price}</span>
                        {!plan.isActive && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Inactive</span>}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-zinc-600 -mr-2">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem className="cursor-pointer">Edit Plan</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600 cursor-pointer"
                                onClick={() => onToggleStatus(plan)}
                            >
                                {plan.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-rose-600 focus:text-rose-600 cursor-pointer"
                                onClick={() => onDelete(plan.id)}
                            >
                                Delete Plan
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Description (Truncated) */}
            {plan.description && (
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 pr-4">
                    {plan.description}
                </p>
            )}

            {/* Bottom Status Bar (Optional visual flare) */}
            <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary" className="bg-zinc-50 text-zinc-500 border-zinc-100 text-[10px] h-5 font-medium">
                    {plan.isActive ? 'Visible to Members' : 'Hidden'}
                </Badge>
            </div>
        </div>
    )
}

// ---------------------------------------
// Main Page Component
// ---------------------------------------
export default function MembershipPlansPage() {
    const router = useRouter()
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [plans, setPlans] = useState<GymSubscriptionPlan[]>([])

    const { currentGym, isLoading: isGymLoading } = useOwnerStore()

    // Form State (for interactivity in the drawer)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [newPlanName, setNewPlanName] = useState("")
    const [newPlanPrice, setNewPlanPrice] = useState("")
    const [newPlanDesc, setNewPlanDesc] = useState("")
    const [duration, setDuration] = useState({ value: 1, unit: PlanType.MONTH })
    const [planToDelete, setPlanToDelete] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        const fetchPlans = async () => {
            if (!currentGym) {
                if (!isGymLoading) setLoading(false)
                return
            }

            try {
                // Get Plans
                const plansRes = await plansAPI.getByGymId(currentGym.id)
                setPlans(extractPlansFromResponse(plansRes))

            } catch (error) {
                console.error("Failed to fetch plans:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPlans()
    }, [currentGym, isGymLoading])

    const handleCreatePlan = async () => {
        if (!currentGym) {
            toast.error("No gym selected. Please create a gym first.")
            return
        }

        if (!newPlanName.trim()) {
            toast.error("Please enter a plan name")
            return
        }

        if (!newPlanPrice || Number(newPlanPrice) <= 0) {
            toast.error("Please enter a valid price")
            return
        }

        if (duration.value <= 0) {
            toast.error("Please enter a valid duration")
            return
        }

        setIsCreating(true)
        try {
            await plansAPI.create({
                gymId: currentGym.id,
                name: newPlanName,
                description: newPlanDesc,
                durationValue: duration.value,
                durationUnit: duration.unit,
                price: Number(newPlanPrice)
            })

            setIsDrawerOpen(false)
            // Reset form
            setNewPlanName("")
            setNewPlanPrice("")
            setNewPlanDesc("")
            setDuration({ value: 1, unit: PlanType.MONTH })

            // Refresh list
            const plansRes = await plansAPI.getByGymId(currentGym.id)
            setPlans(extractPlansFromResponse(plansRes))

            toast.success("Plan created successfully")
        } catch (error) {
            console.error("Failed to create plan:", error)
            toast.error("Failed to create plan")
        } finally {
            setIsCreating(false)
        }
    }

    const handleToggleStatus = async (plan: GymSubscriptionPlan) => {
        if (!currentGym) return

        try {
            await plansAPI.update(plan.id, {
                isActive: !plan.isActive
            })

            // Refresh list
            const plansRes = await plansAPI.getByGymId(currentGym.id)
            setPlans(extractPlansFromResponse(plansRes))
        } catch (error) {
            console.error("Failed to update plan status:", error)
            toast.error("Failed to update plan status")
        }
    }

    const confirmDeletePlan = async () => {
        if (!currentGym || !planToDelete) return;

        try {
            await plansAPI.delete(planToDelete);
            // Refresh list
            const plansRes = await plansAPI.getByGymId(currentGym.id);
            setPlans(extractPlansFromResponse(plansRes));
            toast.success("Plan deleted successfully");
        } catch (error) {
            console.error("Failed to delete plan:", error);
            toast.error("Failed to delete plan");
        } finally {
            setPlanToDelete(null);
        }
    }

    const filteredPlans = plans.filter(p => p?.name && p.name.toLowerCase().includes(search.toLowerCase()));

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        )
    }

    // Show no gym state
    if (!currentGym && !isGymLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center space-y-6">
                    <div className="bg-zinc-100 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center">
                        <Dumbbell className="w-12 h-12 text-zinc-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-zinc-900">No Gym Found</h2>
                        <p className="text-zinc-500 text-sm">
                            You need to create a gym before you can manage membership plans.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/owner/settings')}
                        className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 rounded-2xl font-semibold"
                    >
                        Go to Settings
                    </Button>
                </div>
            </div>
        )
    }

    // Helper for Quick Duration Chips
    const presets = [
        { label: "1 Month", val: 1, unit: PlanType.MONTH },
        { label: "3 Months", val: 3, unit: PlanType.MONTH },
        { label: "6 Months", val: 6, unit: PlanType.MONTH },
        { label: "1 Year", val: 1, unit: PlanType.YEAR },
    ]

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-28">

            {/* --- UNIFIED HEADER --- */}
            <div className="bg-white rounded-b-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border-b border-zinc-100 px-5 pt-8 pb-6 space-y-5">

                {/* Title Row with Back Logic (Visually) */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8 text-zinc-400 hover:text-zinc-900">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Membership Plans</h1>
                    </div>
                    {/* Active Count */}
                    <Badge className="bg-zinc-900 text-white hover:bg-zinc-800">
                        {plans.filter(p => p.isActive).length} Active
                    </Badge>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-800 transition-colors" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search plans..."
                        className="w-full pl-10 h-12 bg-zinc-50 border-zinc-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all placeholder:text-zinc-400"
                    />
                </div>
            </div>

            {/* --- LIST AREA --- */}
            <div className="px-4 py-6 space-y-4">
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">Current Plans</h2>

                <div className="grid gap-3">
                    {filteredPlans.map((plan) => (
                        <PlanItem
                            key={plan.id}
                            plan={plan}
                            onToggleStatus={handleToggleStatus}
                            onDelete={(id) => setPlanToDelete(id)}
                        />
                    ))}
                </div>

                {filteredPlans.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-white p-4 rounded-full mb-3 shadow-sm border border-zinc-100">
                            <Search className="h-6 w-6 text-zinc-300" />
                        </div>
                        <p className="text-zinc-400 text-sm">No plans found</p>
                    </div>
                )}
            </div>

            {/* --- ADD PLAN DRAWER (FAB) --- */}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    <div className="fixed bottom-24 right-4 z-40">
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-2xl shadow-xl shadow-zinc-900/20 bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition-all border border-zinc-700"
                        >
                            <Plus className="h-6 w-6 text-white" strokeWidth={2} />
                        </Button>
                    </div>
                </DrawerTrigger>

                <DrawerContent className="max-w-md mx-auto rounded-t-[32px]">
                    <div className="p-6 bg-zinc-50/50 border-b border-zinc-100">
                        <DrawerHeader className="p-0 text-left">
                            <DrawerTitle className="text-xl font-bold text-zinc-900">New Membership Plan</DrawerTitle>
                            <DrawerDescription>Create a new subscription option.</DrawerDescription>
                        </DrawerHeader>
                    </div>

                    <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">

                        {/* 1. Plan Name */}
                        <div className="space-y-3">
                            <Label className="text-zinc-900 font-bold text-sm">Plan Name</Label>
                            <Input
                                value={newPlanName}
                                onChange={(e) => setNewPlanName(e.target.value)}
                                placeholder="e.g. Gold Quarterly"
                                className="h-12 rounded-2xl border-zinc-200 bg-white shadow-sm text-base"
                            />
                        </div>

                        {/* 2. Price */}
                        <div className="space-y-3">
                            <Label className="text-zinc-900 font-bold text-sm">Price</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={newPlanPrice}
                                    onChange={(e) => setNewPlanPrice(e.target.value)}
                                    placeholder="4500"
                                    className="pl-9 h-12 rounded-2xl border-zinc-200 bg-white shadow-sm text-base font-semibold text-zinc-900"
                                />
                            </div>
                        </div>

                        {/* 3. Simplified Duration (Validity) */}
                        <div className="space-y-4">
                            <Label className="text-zinc-900 font-bold text-sm flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-zinc-400" /> Validity Period
                            </Label>

                            {/* Quick Select Chips */}
                            <div className="grid grid-cols-4 gap-2">
                                {presets.map((preset, idx) => {
                                    const isSelected = duration.value === preset.val && duration.unit === preset.unit;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setDuration({ value: preset.val, unit: preset.unit })}
                                            className={`
                                                py-2.5 px-1 rounded-xl text-xs font-bold transition-all border
                                                ${isSelected
                                                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                                                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'}
                                            `}
                                        >
                                            {preset.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Manual Adjustment (Friendly UI) */}
                            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-zinc-200 shadow-sm">
                                <div className="bg-zinc-50 px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    Custom
                                </div>
                                <Input
                                    type="number"
                                    value={duration.value}
                                    onChange={(e) => setDuration({ ...duration, value: parseInt(e.target.value) || 0 })}
                                    className="h-10 w-16 border-none bg-transparent text-center font-bold text-lg p-0 focus-visible:ring-0 shadow-none"
                                />
                                <div className="h-6 w-[1px] bg-zinc-200" />
                                <Select
                                    value={duration.unit}
                                    onValueChange={(val: PlanType) => setDuration({ ...duration, unit: val })}
                                >
                                    <SelectTrigger className="h-10 border-none bg-transparent shadow-none focus:ring-0 text-sm font-semibold text-zinc-600 gap-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align="end">
                                        <SelectItem value={PlanType.DAY}>Days</SelectItem>
                                        <SelectItem value={PlanType.WEEK}>Weeks</SelectItem>
                                        <SelectItem value={PlanType.MONTH}>Months</SelectItem>
                                        <SelectItem value={PlanType.YEAR}>Years</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 4. Description */}
                        <div className="space-y-3">
                            <Label className="text-zinc-900 font-bold text-sm">Benefits & Notes</Label>
                            <Textarea
                                value={newPlanDesc}
                                onChange={(e) => setNewPlanDesc(e.target.value)}
                                placeholder="What does this plan include?"
                                className="min-h-[100px] rounded-2xl border-zinc-200 bg-white shadow-sm resize-none text-sm p-4"
                            />
                        </div>

                        {/* 5. Active Toggle */}
                        <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-zinc-900">Visible to Members</Label>
                                <p className="text-xs text-zinc-500 font-medium">Enable this plan immediately</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                    </div>

                    <DrawerFooter className="p-6 pt-2">
                        <Button
                            onClick={handleCreatePlan}
                            disabled={isCreating}
                            className="w-full h-14 text-base font-bold bg-zinc-900 hover:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Plan'
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full h-12 rounded-xl text-zinc-500 font-semibold hover:bg-zinc-50 hover:text-zinc-900">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the plan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeletePlan} className="bg-rose-600 hover:bg-rose-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}