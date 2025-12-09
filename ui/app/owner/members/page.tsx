'use client'

import { useState } from "react"
import { useOwnerStore } from "@/lib/store/ownerStore"
import { Search, UserPlus, Phone, MoreHorizontal, CalendarClock, Users, CreditCard, Calendar, Loader2, ArrowRight, Filter } from "lucide-react"

// SHADCN / UI Imports
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { useMembersQuery, usePlansQuery, useAddMemberMutation, useActivateSubscriptionMutation, Member } from "@/lib/hooks/queries/useMembers"
import { cn } from "@/lib/utils"

// ---------------------------------------
// Helper: Status Styles
// ---------------------------------------
const getStatusStyles = (status: string) => {
    switch (status) {
        case 'active': return { color: 'bg-emerald-500', ring: 'ring-emerald-100', text: 'text-emerald-600', bg: 'bg-emerald-50' };
        case 'expiring': return { color: 'bg-amber-500', ring: 'ring-amber-100', text: 'text-amber-600', bg: 'bg-amber-50' };
        case 'inactive': return { color: 'bg-zinc-300', ring: 'ring-zinc-100', text: 'text-zinc-500', bg: 'bg-zinc-100' };
        case 'pending': return { color: 'bg-blue-500', ring: 'ring-blue-100', text: 'text-blue-600', bg: 'bg-blue-50' };
        default: return { color: 'bg-zinc-300', ring: 'ring-zinc-100', text: 'text-zinc-500', bg: 'bg-zinc-100' };
    }
}

// ---------------------------------------
// Component: Member Item 
// ---------------------------------------
function MemberItem({ id, name, phone, accessCode, status, lastVisit, planName, endDate, onActivate }: Member & { onActivate: (id: string) => void }) {
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    const styles = getStatusStyles(status);

    return (
        <div className="group relative bg-white border border-zinc-100 rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200 overflow-hidden">


            <div className="p-4 flex items-center gap-3.5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-zinc-100">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                        <AvatarFallback className="bg-zinc-50 text-zinc-600 font-bold text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white ${styles.color}`} />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-bold text-[15px] text-zinc-900 truncate">{name}</h3>
                        {/* Mobile Status Badge for Clarity */}
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", styles.bg, styles.text)}>
                            {status}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="truncate">{phone}</span>
                            {planName && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                                    <span className="font-medium text-zinc-700 truncate">{planName}</span>
                                </>
                            )}
                        </div>

                        {/* Meta Info Row */}
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                            {lastVisit && (
                                <div className="flex items-center gap-1">
                                    <CalendarClock className="h-3 w-3" />
                                    <span>Last: {lastVisit}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar / Code Display */}
            <div className="bg-zinc-50/50 border-t border-zinc-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-white border border-zinc-200 rounded-md px-2 py-1 flex flex-col items-center min-w-[60px]">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Code</span>
                        <span className="font-mono text-sm font-bold text-zinc-900 tracking-wide">{accessCode}</span>
                    </div>
                    {endDate && (
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-400">Expires</span>
                            <span className="text-xs font-semibold text-zinc-700">{endDate}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {status === 'pending' ? (
                        <Button
                            size="sm"
                            className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 rounded-xl shadow-sm shadow-blue-200"
                            onClick={() => onActivate(id)}
                        >
                            Activate
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-200 hover:bg-zinc-100" onClick={() => window.open(`tel:${phone}`, '_self')}>
                                <Phone className="h-4 w-4 text-zinc-500" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-100">
                                        <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                                    <DropdownMenuItem className="cursor-pointer text-xs font-medium rounded-lg h-9">View Profile</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer text-xs font-medium rounded-lg h-9">Delete Member</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------
// Main Members Page
// ---------------------------------------
export default function MembersPage() {
    const [filter, setFilter] = useState<"all" | "active" | "inactive" | "expiring" | "pending">("all")
    const [search, setSearch] = useState("")
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
    const [newMember, setNewMember] = useState({ name: '', phone: '', planId: '' })
    const [memberToActivate, setMemberToActivate] = useState<string | null>(null)

    const { currentGym, isLoading: isGymLoading } = useOwnerStore()

    const { data: membersData, isLoading: isMembersLoading } = useMembersQuery(currentGym?.id);
    const { data: plansData } = usePlansQuery(currentGym?.id);
    const addMemberMutation = useAddMemberMutation(currentGym?.id || '');
    const activateSubscriptionMutation = useActivateSubscriptionMutation(currentGym?.id || '');

    const members = membersData || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plans = (plansData as any[]) || [];

    const handleAddMember = async () => {
        if (!currentGym) {
            toast.error("No gym selected.")
            return
        }
        if (!newMember.name.trim() || !newMember.phone.trim() || !newMember.planId) {
            toast.error("Please fill all details")
            return
        }

        addMemberMutation.mutate(
            { name: newMember.name, mobileNumber: newMember.phone, planId: newMember.planId },
            {
                onSuccess: () => {
                    setIsAddMemberOpen(false)
                    setNewMember({ name: '', phone: '', planId: '' })
                    toast.success("Member added successfully")
                },
                onError: () => toast.error("Failed to add member")
            }
        );
    }

    const confirmActivate = async () => {
        if (!memberToActivate) return;
        activateSubscriptionMutation.mutate(memberToActivate, {
            onSuccess: () => {
                toast.success("Subscription activated");
                setMemberToActivate(null);
            },
            onError: () => toast.error("Failed to activate")
        });
    };

    const filtered = members.filter((m) => {
        const matchesFilter = filter === "all" || m.status === filter
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search) || m.accessCode.includes(search)
        return matchesFilter && matchesSearch
    })

    const counts = {
        all: members.length,
        active: members.filter(m => m.status === 'active').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        expiring: members.filter(m => m.status === 'expiring').length,
        pending: members.filter(m => m.status === 'pending').length,
    };

    const FilterPill = ({ id, label, count }: { id: typeof filter, label: string, count: number }) => (
        <button
            onClick={() => setFilter(id)}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                filter === id
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-200 scale-105"
                    : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
            )}
        >
            {label}
            {count > 0 && (
                <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px]",
                    filter === id ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-400"
                )}>
                    {count}
                </span>
            )}
        </button>
    )

    const showLoader = isGymLoading || (currentGym && isMembersLoading && !membersData);

    if (showLoader) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        )
    }

    // Empty State: No Gym
    if (!currentGym && !isGymLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-zinc-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-10 h-10 text-zinc-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Setup Required</h2>
                        <p className="text-zinc-500 text-sm mt-2 px-8">Create a gym profile to start managing members.</p>
                    </div>
                    <Button onClick={() => window.location.href = '/owner/settings'} className="w-full h-12 rounded-2xl">
                        Go to Settings
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-32">

            {/* --- UNIFIED APP HEADER --- */}
            <div className="bg-white pb-4 pt-8 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.03)] rounded-b-[32px]">
                <div className="px-5">
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-5">
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Members</h1>
                        <div className="flex items-center gap-2">
                            {plans.length === 0 && (
                                <Badge variant="destructive" className="animate-pulse rounded-full px-3">No Plans Configured</Badge>
                            )}
                            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                                <span className="font-bold text-sm text-zinc-600">{counts.all}</span>
                            </div>
                        </div>
                    </div>

                    {/* Search Field */}
                    <div className="relative mb-5">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find by name, phone, code..."
                            className="w-full h-14 pl-12 bg-zinc-50 border-transparent rounded-2xl text-base focus:bg-white focus:border-zinc-200 focus:ring-0 transition-all shadow-inner"
                        />
                    </div>

                    {/* Horizontal Scroll Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-5 px-5">
                        <FilterPill id="all" label="All" count={counts.all} />
                        <FilterPill id="pending" label="Pending" count={counts.pending} />
                        <FilterPill id="active" label="Active" count={counts.active} />
                        <FilterPill id="expiring" label="Expiring" count={counts.expiring} />
                        <FilterPill id="inactive" label="Inactive" count={counts.inactive} />
                    </div>
                </div>
            </div>

            {/* --- MEMBERS LIST --- */}
            <div className="px-4 py-6 space-y-4">
                {filtered.map((member) => (
                    <MemberItem key={member.id} {...member} onActivate={(id) => setMemberToActivate(id)} />
                ))}

                {/* Empty Search Result */}
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <Filter className="w-12 h-12 text-zinc-300 mb-4" />
                        <p className="text-zinc-900 font-semibold">No members found</p>
                        <p className="text-sm text-zinc-500">Try changing filters or search terms</p>
                    </div>
                )}
            </div>

            {/* --- FAB (Floating Action Button) --- */}
            <Drawer open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DrawerTrigger asChild>
                    <div className="fixed bottom-24 right-5 z-40">
                        <button className="group relative flex items-center justify-center h-16 w-16 bg-zinc-900 rounded-[24px] shadow-2xl shadow-zinc-900/30 text-white hover:scale-105 active:scale-95 transition-all duration-300">
                            <UserPlus className="w-7 h-7" strokeWidth={2} />
                            {/* Pulse Effect */}
                            {counts.all === 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white"></span>
                                </span>
                            )}
                        </button>
                    </div>
                </DrawerTrigger>

                <DrawerContent className="rounded-t-[32px]">
                    <div className="mx-auto w-full max-w-sm pb-8">
                        <div className="p-6 bg-zinc-50/50 border-b border-zinc-100 mb-4">
                            <DrawerHeader className="p-0 text-left">
                                <DrawerTitle className="text-xl font-bold">Add New Member</DrawerTitle>
                                <DrawerDescription>Create a new membership manually.</DrawerDescription>
                            </DrawerHeader>
                        </div>

                        <div className="px-6 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Rahul Kumar"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    className="h-12 rounded-xl border-zinc-200 focus:border-zinc-900 focus:ring-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="e.g. 9876543210"
                                    value={newMember.phone}
                                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                    className="h-12 rounded-xl border-zinc-200 focus:border-zinc-900 focus:ring-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plan" className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Subscription Plan</Label>
                                <Select
                                    value={newMember.planId}
                                    onValueChange={(val) => setNewMember({ ...newMember, planId: val })}
                                >
                                    <SelectTrigger id="plan" className="h-12 rounded-xl border-zinc-200">
                                        <SelectValue placeholder="Select a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-zinc-500">
                                                No plans available.
                                                <Button variant="link" onClick={() => window.location.href = '/owner/plans'}>Create Plan</Button>
                                            </div>
                                        ) : (
                                            plans.map((plan) => (
                                                <SelectItem key={plan.id} value={plan.id}>
                                                    <span className="font-semibold text-zinc-900">{plan.name}</span>
                                                    <span className="text-zinc-500 ml-2">₹{plan.price}</span>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={handleAddMember} disabled={addMemberMutation.isPending} className="w-full h-14 rounded-2xl text-base font-bold bg-zinc-900 mt-4">
                                {addMemberMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Member"}
                            </Button>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Confirmation Dialog */}
            <AlertDialog open={!!memberToActivate} onOpenChange={(open) => !open && setMemberToActivate(null)}>
                <AlertDialogContent className="rounded-2xl w-[90%] max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Activate Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the user as active and start their plan validity from today.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-2 justify-end">
                        <AlertDialogCancel className="mt-0 flex-1 rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmActivate} className="flex-1 bg-zinc-900 hover:bg-zinc-800 rounded-xl">Activate</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}