'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CreditCard,
  MapPin,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Loader2,
  Edit2,
  Camera,
  Dumbbell,
  Activity,
  ArrowUpRight
} from 'lucide-react';
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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { usersAPI, gymsAPI } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';

interface Gym {
  id: string;
  name: string;
  address?: string;
}

interface UserProfile {
  id: string;
  name: string;
  mobileNumber: string;
  email?: string;
  roles: string[];
  gymsOwned?: Gym[];
}

export default function SettingsPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Gym Creation State
  const [isCreatingGym, setIsCreatingGym] = useState(false);
  const [newGymName, setNewGymName] = useState('');
  const [newGymAddress, setNewGymAddress] = useState('');
  const [isCreatingGymLoading, setIsCreatingGymLoading] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await usersAPI.getMe();
      const userData = res.data.data || res.data;
      setUser(userData);
      setEditName(userData.name);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) return;

    setIsSaving(true);
    try {
      await usersAPI.updateMe({ name: editName });
      setUser((prev) => prev ? { ...prev, name: editName } : null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateGym = async () => {
    if (!newGymName.trim()) return;

    setIsCreatingGymLoading(true);
    try {
      await gymsAPI.create({
        name: newGymName,
        address: newGymAddress,
      });
      await fetchUserProfile(); // Refresh to get the new gym
      setIsCreatingGym(false);
      setNewGymName('');
      setNewGymAddress('');
      toast.success('Gym created successfully!');
    } catch (error) {
      console.error('Failed to create gym:', error);
      toast.error('Failed to create gym. Please try again.');
    } finally {
      setIsCreatingGymLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const confirmUpgradeToOwner = async () => {
    try {
      await usersAPI.upgradeToOwner();
      toast.success('Congratulations! You are now a Gym Owner. Please sign in again.');
      logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Failed to upgrade to owner:', error);
      toast.error('Failed to upgrade to owner. Please try again.');
    } finally {
      setShowUpgradeDialog(false);
    }
  };

  const isOwner = user?.roles?.includes('OWNER');

  const menuItems = [
    {
      section: 'My Activity',
      items: [
        {
          title: 'My Subscriptions',
          description: 'View active plans and history',
          icon: Activity,
          onClick: () => router.push('/user/subscriptions')
        },
        {
          title: 'Payment History',
          description: 'View past transactions',
          icon: ArrowUpRight,
          onClick: () => router.push('/user/payments')
        },
      ]
    },
    {
      section: 'Account',
      items: [
        { title: 'Payment Methods', description: 'Manage your payment options', icon: CreditCard },
        // Conditionally render Gyms or Saved Addresses
        ...(isOwner
          ? [{
            title: 'Gyms',
            description: 'Manage your gyms',
            icon: Dumbbell,
            onClick: () => {
              if (user?.gymsOwned && user.gymsOwned.length > 0) {
                toast.info(`You manage: ${user.gymsOwned[0].name}`);
              } else {
                setIsCreatingGym(true);
              }
            }
          }]
          : [
            { title: 'Saved Addresses', description: 'Manage your gym locations', icon: MapPin },
            {
              title: 'Become a Gym Owner',
              description: 'Start managing your own gym',
              icon: Dumbbell,
              onClick: () => setShowUpgradeDialog(true)
            }
          ]
        ),
      ],
    },
    {
      section: 'Support',
      items: [
        { title: 'Help & Support', description: 'Get help with your account', icon: HelpCircle },
        { title: 'Privacy Policy', description: 'Read our privacy policy', icon: Shield },
        { title: 'Terms of Service', description: 'Review our terms', icon: FileText },
      ],
    },
  ];

  const preferences = [
    { id: 'notifications', label: 'Notifications', defaultChecked: true },
    { id: 'email-updates', label: 'Email Updates', defaultChecked: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">

      {/* --- HEADER & PROFILE CARD --- */}
      <div className="bg-white rounded-b-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border-b border-zinc-100 px-5 pt-8 pb-8 space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="relative flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="relative flex-shrink-0">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
              <AvatarFallback className="bg-zinc-800 text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute bottom-0 right-0 p-1 bg-zinc-900 text-white rounded-full border-2 border-white shadow-sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-zinc-900 truncate">{user?.name}</h2>
            <p className="text-sm text-zinc-500 font-medium truncate">{user?.mobileNumber}</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.roles?.map((role) => (
                <span key={role} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide mr-1">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">

        {/* Preferences Section */}
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 px-2">Preferences</h2>
          <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
            {preferences.map((pref, idx) => (
              <div key={pref.id} className={`flex items-center gap-3 px-4 py-3.5 ${idx !== preferences.length - 1 ? 'border-b border-zinc-50' : ''}`}>
                <Checkbox
                  id={pref.id}
                  defaultChecked={pref.defaultChecked}
                  className="cursor-pointer data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                />
                <label htmlFor={pref.id} className="flex-1 text-sm font-semibold text-zinc-700 cursor-pointer select-none">
                  {pref.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 px-2">{section.section}</h2>
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(item as any).onClick}
                  className={`w-full px-4 py-3.5 flex items-center justify-between transition-colors hover:bg-zinc-50 ${itemIndex !== section.items.length - 1 ? 'border-b border-zinc-50' : ''}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                      <p className="text-[11px] text-zinc-400 font-medium">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 bg-white border-zinc-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-100 rounded-2xl font-semibold gap-2 shadow-sm mt-4"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>

        {/* Footer Info */}
        <div className="text-center pt-4 pb-8">
          <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">FitGym v1.0.0</p>
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
              disabled={isSaving}
              className="w-full h-14 text-base font-bold bg-zinc-900 hover:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200"
            >
              {isSaving ? (
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
              disabled={isCreatingGymLoading || !newGymName.trim()}
              className="w-full h-14 text-base font-bold bg-zinc-900 hover:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200"
            >
              {isCreatingGymLoading ? (
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

      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Become a Gym Owner?</AlertDialogTitle>
            <AlertDialogDescription>
              This will enable owner features for your account. You will need to sign in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUpgradeToOwner} className="bg-zinc-900 hover:bg-zinc-800">Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
