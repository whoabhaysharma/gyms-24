'use client'

import { useState } from 'react';
import { useUsersQuery, useDeleteUserMutation, useRestoreUserMutation, useAddRoleMutation, useRemoveRoleMutation } from '@/lib/hooks/queries/useUsers';
import {
    Loader2,
    Search,
    User as UserIcon,
    Shield,
    Trash2,
    RefreshCw,
    MoreHorizontal,
    Phone,
    Crown,
    Calendar,
    BadgeCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AdminUsersPage() {
    // --- State ---
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

    // --- Queries ---
    const { data, isLoading } = useUsersQuery({
        search: search || undefined,
        role: roleFilter,
        includeDeleted: true,
    });

    const deleteMutation = useDeleteUserMutation();
    const restoreMutation = useRestoreUserMutation();
    const addRoleMutation = useAddRoleMutation();
    const removeRoleMutation = useRemoveRoleMutation();

    const users = data?.data || [];

    // --- Handlers ---
    const handleRoleToggle = (userId: string, role: string, currentRoles: string[]) => {
        if (currentRoles.includes(role)) {
            removeRoleMutation.mutate({ userId, role });
        } else {
            addRoleMutation.mutate({ userId, role });
        }
    };

    // --- Components ---
    const RoleBadge = ({ role }: { role: string }) => {
        const styles = {
            ADMIN: "bg-violet-50 text-violet-700 border-violet-100",
            OWNER: "bg-amber-50 text-amber-700 border-amber-100",
            USER: "bg-zinc-100 text-zinc-600 border-zinc-200"
        };
        const icons = {
            ADMIN: <Shield className="w-3 h-3 mr-1" />,
            OWNER: <Crown className="w-3 h-3 mr-1" />,
            USER: <UserIcon className="w-3 h-3 mr-1" />
        };

        return (
            <div className={cn(
                "flex items-center px-2 py-1 rounded-md border text-[10px] font-bold tracking-wider uppercase",
                styles[role as keyof typeof styles] || styles.USER
            )}>
                {icons[role as keyof typeof icons]}
                {role}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans selection:bg-zinc-900 selection:text-white">

            {/* --- Sticky Header --- */}
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 pt-safe-top">
                <div className="px-5 pt-4 pb-4">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-900/20">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-zinc-900 leading-none">Team & Users</h1>
                            <p className="text-xs text-zinc-500 mt-1 font-medium">
                                {isLoading ? "Loading..." : `${users.length} accounts found`}
                            </p>
                        </div>
                    </div>

                    {/* Search & Filter Container */}
                    <div className="space-y-3">
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                                <Search className="w-4 h-4 text-zinc-400" />
                            </div>
                            <Input
                                placeholder="Search name or phone..."
                                className="pl-14 h-12 bg-white border-zinc-200 rounded-2xl shadow-sm text-sm focus-visible:ring-zinc-900 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Filter Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                            <button
                                onClick={() => setRoleFilter(undefined)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                    !roleFilter
                                        ? "bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-900/10"
                                        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                                )}
                            >
                                All Users
                            </button>
                            {['OWNER', 'ADMIN', 'USER'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRoleFilter(r)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5",
                                        roleFilter === r
                                            ? "bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-900/10"
                                            : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    {r === 'OWNER' && <Crown className="w-3 h-3" />}
                                    {r === 'ADMIN' && <Shield className="w-3 h-3" />}
                                    {r.charAt(0) + r.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* --- User List --- */}
            <main className="px-4 py-4 space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-zinc-300" />
                        </div>
                        <h3 className="font-semibold text-zinc-900">No users found</h3>
                        <p className="text-sm text-zinc-500 mt-1">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    users.map((user) => {
                        const isDeleted = !!user.deletedAt;

                        return (
                            <div
                                key={user.id}
                                className={cn(
                                    "group relative bg-white rounded-2xl p-4 border transition-all duration-300",
                                    isDeleted
                                        ? "border-zinc-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                        : "border-zinc-100 shadow-sm hover:shadow-md hover:border-zinc-200"
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3.5">
                                        <Avatar className="h-12 w-12 border border-zinc-100 shadow-sm">
                                            <AvatarFallback className={cn("text-sm font-bold", isDeleted ? "bg-zinc-100 text-zinc-400" : "bg-zinc-50 text-zinc-700")}>
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="space-y-1">
                                            <div>
                                                <h3 className={cn("font-bold text-zinc-900 leading-tight flex items-center gap-2", isDeleted && "line-through text-zinc-500")}>
                                                    {user.name}
                                                    {user.roles.includes('OWNER') && !isDeleted && (
                                                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" />
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
                                                    <Phone className="w-3 h-3" />
                                                    <span className="text-xs font-medium tabular-nums">{user.mobileNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1 text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 rounded-full">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-xl shadow-zinc-200/50 border-zinc-100">
                                            <DropdownMenuLabel className="text-xs text-zinc-400 font-medium uppercase tracking-wider px-2 py-1.5">
                                                Manage Roles
                                            </DropdownMenuLabel>

                                            <DropdownMenuItem
                                                onClick={() => handleRoleToggle(user.id, 'ADMIN', user.roles)}
                                                className="rounded-lg p-2 cursor-pointer"
                                            >
                                                <div className={cn("h-8 w-8 rounded-md flex items-center justify-center mr-3 border", user.roles.includes('ADMIN') ? "bg-violet-50 border-violet-100 text-violet-600" : "bg-white border-zinc-200 text-zinc-400")}>
                                                    <Shield className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">Administrator</span>
                                                    <span className="text-[10px] text-zinc-400">{user.roles.includes('ADMIN') ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => handleRoleToggle(user.id, 'OWNER', user.roles)}
                                                className="rounded-lg p-2 cursor-pointer"
                                            >
                                                <div className={cn("h-8 w-8 rounded-md flex items-center justify-center mr-3 border", user.roles.includes('OWNER') ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-white border-zinc-200 text-zinc-400")}>
                                                    <Crown className="w-4 h-4" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">Owner</span>
                                                    <span className="text-[10px] text-zinc-400">{user.roles.includes('OWNER') ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator className="my-1 bg-zinc-100" />

                                            {isDeleted ? (
                                                <DropdownMenuItem
                                                    onClick={() => restoreMutation.mutate(user.id)}
                                                    className="rounded-lg p-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-3 ml-1.5" />
                                                    <span className="font-semibold">Restore User</span>
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => deleteMutation.mutate(user.id)}
                                                    className="rounded-lg p-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-3 ml-1.5" />
                                                    <span className="font-semibold">Delete User</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-2 flex-wrap">
                                        {user.roles.map(role => (
                                            <RoleBadge key={role} role={role} />
                                        ))}
                                        {isDeleted && (
                                            <Badge variant="destructive" className="h-[22px] px-2 rounded-md text-[10px] font-bold tracking-wider uppercase">
                                                Deleted
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}