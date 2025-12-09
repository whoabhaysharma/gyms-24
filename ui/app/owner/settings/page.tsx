'use client'

import { useState } from "react"
import {
    Settings,
    ChevronRight,
    CreditCard,
    Bell,
    Shield,
    LogOut,
    Store,
    Dumbbell,
    Users,
    HelpCircle,
    ToggleRight,
    Edit2,
    Camera,
    Loader2,
    Activity
} from "lucide-react"
import { toast } from "sonner"

// SHADCN / UI Imports
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from '@/components/ui/drawer'
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/authStore"
import { useOwnerStore } from "@/lib/store/ownerStore"
import { useUserProfileQuery, useUpdateProfileMutation, useCreateGymMutation } from "@/lib/hooks/queries/useSettings"
import { usePlansQuery } from "@/lib/hooks/queries/useMembers"

// ---------------------------------------
// Types
// ---------------------------------------
interface SettingItemProps {
    icon: React.ElementType
    label: string
    sub?: string
    action?: React.ReactNode
    onClick?: () => void
    isDestructive?: boolean
}

// ---------------------------------------
// Component: Setting Item Row
// ---------------------------------------
function SettingItem({ icon: Icon, label, sub, action, onClick, isDestructive }: SettingItemProps) {
    return (
        <div
            onClick={onClick}
            className={`
                group flex items-center justify-between p-4 bg-white border border-zinc-100 
                first:rounded-t-2xl last:rounded-b-2xl 
                [&:not(:last-child)]:border-b-0 
                hover:bg-zinc-50 cursor-pointer transition-colors
            `}
        >
            {/* Left Side: Icon & Text */}
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${isDestructive ? 'bg-rose-50 text-rose-500' : 'bg-zinc-50 text-zinc-600'}
                `}>
                    <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1 pr-2">
                    <h3 className={`font-semibold text-sm truncate ${isDestructive ? 'text-rose-600' : 'text-zinc-900'}`}>
                        {label}
                    </h3>
                    {sub && <p className="text-xs text-zinc-400 font-medium truncate">{sub}</p>}
                </div>
            </div>

            {/* Right Side: Action or Chevron */}
            <div className="flex-shrink-0 text-zinc-300 flex items-center">
                {action || <ChevronRight className="w-5 h-5 group-hover:text-zinc-500 transition-colors" />}
            </div>
        </div>
    )
}

// ---------------------------------------
// Component: Section Container
// ---------------------------------------
function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">{title}</h2>
            <div className="shadow-sm shadow-zinc-200/50 rounded-2xl overflow-hidden">
                {children}
            </div>
        </div>
    )
}

// ---------------------------------------
// Main Settings Page
// ---------------------------------------
export default function SettingsPage() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const { currentGym } = useOwnerStore();

    // React Query Hooks
    const { data: user, isLoading: isUserLoading } = useUserProfileQuery();
    const { data: plansData } = usePlansQuery(currentGym?.id);
    const updateProfileMutation = useUpdateProfileMutation();
    const createGymMutation = useCreateGymMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');

    // Gym Creation State
    const [isCreatingGym, setIsCreatingGym] = useState(false);
    const [newGymName, setNewGymName] = useState('');
    const [newGymAddress, setNewGymAddress] = useState('');

    // Update local state when user data loads
    if (!editName && user?.name) {
        setEditName(user.name);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activePlansCount = (plansData as any[])?.length || null;

    const handleUpdateProfile = async () => {
        if (!editName.trim()) return;

        updateProfileMutation.mutate(
            { name: editName },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    toast.success('Profile updated successfully');
                },
                onError: (error) => {
                    console.error('Failed to update profile:', error);
                    toast.error('Failed to update profile');
                }
            }
        );
    };

    const handleCreateGym = async () => {
        if (!newGymName.trim()) return;

        createGymMutation.mutate(
            {
                name: newGymName,
                address: newGymAddress,
            },
            {
                onSuccess: () => {
                    setIsCreatingGym(false);
                    setNewGymName('');
                    setNewGymAddress('');
                    toast.success('Gym created successfully!');
                },
                onError: (error) => {
                    console.error('Failed to create gym:', error);
                    toast.error('Failed to create gym. Please try again.');
                }
            }
        );
    };

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    if (isUserLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-32">

            {/* --- FIXED HEADER --- */}
            <div className="bg-white rounded-b-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border-b border-zinc-100 px-5 pt-8 pb-8 space-y-6 overflow-hidden">

                {/* Title Row */}
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 flex-shrink-0">
                        <Settings className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
                </div>

                {/* Profile Card */}
                <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 relative overflow-hidden">

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                            <AvatarFallback className="bg-zinc-800 text-white font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-zinc-900 truncate">{user?.name}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="bg-white text-zinc-500 border-zinc-200 text-[10px] h-5 px-2 font-bold shadow-none">
                                {user?.role}
                            </Badge>
                            <span className="text-xs text-zinc-400 font-medium truncate">{user?.mobileNumber}</span>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-300 hover:text-zinc-600 flex-shrink-0 -mr-2"
                        onClick={() => {
                            setEditName(user?.name || '');
                            setIsEditing(true);
                        }}
                    >
                        <Edit2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>


            {/* --- CONTENT AREA --- */}
            <div className="px-4 py-6 space-y-8">

                {/* Section 1: Gym Configuration */}
                <SettingsSection title="Gym Configuration">
                    <SettingItem
                        icon={Dumbbell}
                        label="Membership Plans"
                        sub="Manage prices & duration"
                        onClick={
                            () => router.push('/owner/settings/plans')
                        }
                        action={
                            <Badge className="bg-zinc-900 text-white hover:bg-zinc-800 text-[10px] h-5">
                                {activePlansCount !== null ? `${activePlansCount} Active` : 'Loading...'}
                            </Badge>
                        }
                    />
                    <SettingItem
                        icon={Users}
                        label="Trainers & Staff"
                        sub="Add coaches and staff"
                    />
                    <SettingItem
                        icon={Store}
                        label="Gyms"
                        sub="Manage your gyms"
                        onClick={() => {
                            if (user?.gymsOwned && user.gymsOwned.length > 0) {
                                toast.info(`You manage: ${user.gymsOwned[0].name}`);
                            } else {
                                setIsCreatingGym(true);
                            }
                        }}
                    />
                    <SettingItem
                        icon={Activity}
                        label="Activities"
                        sub="Audit logs & history"
                        onClick={() => router.push('/owner/settings/activities')}
                    />
                </SettingsSection>

                {/* Section 2: App Preferences */}
                <SettingsSection title="App Preferences">
                    <SettingItem
                        icon={Bell}
                        label="Notifications"
                        sub="Push alerts, Emails"
                        action={<ToggleRight className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />}
                    />
                    <SettingItem
                        icon={CreditCard}
                        label="Payment Gateway"
                        sub="Razorpay linked"
                    />
                </SettingsSection>

                {/* Section 3: Security */}
                <SettingsSection title="Security & Support">
                    <SettingItem
                        icon={Shield}
                        label="Privacy & Security"
                        sub="Change password"
                    />
                    <SettingItem
                        icon={HelpCircle}
                        label="Help & Support"
                        sub="Contact support"
                    />
                </SettingsSection>

                {/* Logout Button */}
                <div className="pt-2">
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full h-12 bg-white border-zinc-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-100 rounded-2xl font-semibold gap-2 shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                    <p className="text-center text-[10px] text-zinc-300 mt-5 font-mono">
                        Version 2.4.0 (Build 202)
                    </p>
                </div>

            </div>

            {/* Edit Profile Drawer */}
            <Drawer open={isEditing} onOpenChange={setIsEditing}>
                <DrawerContent className="max-w-md mx-auto rounded-t-[32px]">
                    <div className="p-6 bg-zinc-50/50 border-b border-zinc-100">
                        <DrawerHeader className="p-0 text-left">
                            <DrawerTitle className="text-xl font-bold text-zinc-900">Edit Profile</DrawerTitle>
                            <DrawerDescription>Update your personal information.</DrawerDescription>
                        </DrawerHeader>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editName}`} />
                                    <AvatarFallback className="bg-zinc-800 text-white text-2xl font-bold">
                                        {editName?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 p-2 bg-zinc-900 text-white rounded-full border-4 border-white shadow-sm cursor-pointer hover:bg-zinc-800">
                                    <Camera className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-900 font-bold text-sm">Full Name</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="h-12 rounded-2xl border-zinc-200 bg-white shadow-sm text-base font-medium"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="space-y-3 opacity-60">
                            <Label className="text-zinc-900 font-bold text-sm">Mobile Number</Label>
                            <Input
                                value={user?.mobileNumber || ''}
                                disabled
                                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 text-base font-medium"
                            />
                            <p className="text-[10px] text-zinc-400 font-medium px-1">Mobile number cannot be changed directly.</p>
                        </div>
                    </div>

                    <DrawerFooter className="p-6 pt-2">
                        <Button
                            onClick={handleUpdateProfile}
                            disabled={updateProfileMutation.isPending}
                            className="w-full h-14 text-base font-bold bg-zinc-900 hover:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200"
                        >
                            {updateProfileMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full h-12 rounded-xl text-zinc-500 font-semibold hover:bg-zinc-50 hover:text-zinc-900">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Create Gym Drawer */}
            <Drawer open={isCreatingGym} onOpenChange={setIsCreatingGym}>
                <DrawerContent className="max-w-md mx-auto rounded-t-[32px]">
                    <div className="p-6 bg-zinc-50/50 border-b border-zinc-100">
                        <DrawerHeader className="p-0 text-left">
                            <DrawerTitle className="text-xl font-bold text-zinc-900">Create Gym</DrawerTitle>
                            <DrawerDescription>Add a new gym to your account.</DrawerDescription>
                        </DrawerHeader>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-zinc-900 font-bold text-sm">Gym Name</Label>
                            <Input
                                value={newGymName}
                                onChange={(e) => setNewGymName(e.target.value)}
                                className="h-12 rounded-2xl border-zinc-200 bg-white shadow-sm text-base font-medium"
                                placeholder="e.g. Iron Paradise"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-900 font-bold text-sm">Address</Label>
                            <Input
                                value={newGymAddress}
                                onChange={(e) => setNewGymAddress(e.target.value)}
                                className="h-12 rounded-2xl border-zinc-200 bg-white shadow-sm text-base font-medium"
                                placeholder="e.g. 123 Fitness St."
                            />
                        </div>
                    </div>

                    <DrawerFooter className="p-6 pt-2">
                        <Button
                            onClick={handleCreateGym}
                            disabled={createGymMutation.isPending || !newGymName.trim()}
                            className="w-full h-14 text-base font-bold bg-zinc-900 hover:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200"
                        >
                            {createGymMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Gym'
                            )}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="ghost" className="w-full h-12 rounded-xl text-zinc-500 font-semibold hover:bg-zinc-50 hover:text-zinc-900">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
