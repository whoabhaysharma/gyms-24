'use client';

import { useState } from 'react';
import {
    Bell,
    CheckCircle2,
    Info,
    AlertTriangle,
    XCircle,
    Clock,
    Check,
    Inbox,
    CheckCheck
} from 'lucide-react';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from "@/lib/hooks/queries/useNotifications";

// --- Helpers ---

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        case 'ERROR': return <XCircle className="w-5 h-5 text-rose-500" />;
        case 'INFO': default: return <Info className="w-5 h-5 text-blue-500" />;
    }
};

const groupNotifications = (notifications: any[]) => {
    const groups: { [key: string]: any[] } = { 'Today': [], 'Yesterday': [], 'Earlier': [] };

    notifications.forEach(notif => {
        try {
            const date = new Date(notif.createdAt);
            if (isNaN(date.getTime())) { groups['Earlier'].push(notif); return; }
            if (isToday(date)) groups['Today'].push(notif);
            else if (isYesterday(date)) groups['Yesterday'].push(notif);
            else groups['Earlier'].push(notif);
        } catch (e) { groups['Earlier'].push(notif); }
    });
    return groups;
};

export function NotificationDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    const { data, isLoading } = useNotificationsQuery();
    const markReadMutation = useMarkNotificationReadMutation();
    const markAllReadMutation = useMarkAllNotificationsReadMutation();

    const notifications = Array.isArray(data?.notifications) ? data.notifications : [];
    const unreadCount = typeof data?.unreadCount === 'number' ? data.unreadCount : 0;
    const unreadNotifications = notifications.filter((n: any) => !n.isRead);

    const groupedAll = groupNotifications(notifications);
    const groupedUnread = groupNotifications(unreadNotifications);

    const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        markReadMutation.mutate(id);
    };

    // Sub-component for the list to keep the main component clean
    const NotificationList = ({ groups, isEmpty }: { groups: { [key: string]: any[] }, isEmpty: boolean }) => {
        if (isEmpty) {
            return (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
                    <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
                        <Inbox className="w-10 h-10 text-zinc-300" />
                    </div>
                    <h3 className="text-zinc-900 font-bold text-lg mb-2">All caught up!</h3>
                    <p className="text-zinc-500 text-sm max-w-[250px] leading-relaxed">
                        You have no {activeTab === "unread" ? "unread" : ""} notifications at the moment.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-8 pb-6 px-4 pt-2">
                {Object.entries(groups).map(([label, items]) => (
                    items.length > 0 && (
                        <div key={label} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</h4>
                                <div className="h-[1px] bg-zinc-100 flex-1"></div>
                            </div>

                            <div className="space-y-3">
                                {items.map((notif: any) => (
                                    <div
                                        key={notif.id}
                                        className={cn(
                                            "relative p-4 rounded-3xl border transition-all duration-200 active:scale-[0.98]",
                                            !notif.isRead
                                                ? "bg-white border-indigo-100 shadow-[0_4px_20px_-10px_rgba(99,102,241,0.2)]"
                                                : "bg-zinc-50/50 border-zinc-100/80"
                                        )}
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div className="shrink-0 pt-1">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm",
                                                    !notif.isRead ? "bg-white border-zinc-100" : "bg-zinc-100 border-zinc-200 grayscale opacity-70"
                                                )}>
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <h5 className={cn(
                                                        "text-sm leading-tight pr-6",
                                                        !notif.isRead ? "font-bold text-zinc-900" : "font-medium text-zinc-600"
                                                    )}>
                                                        {notif.title}
                                                    </h5>
                                                </div>
                                                <p className={cn(
                                                    "text-xs leading-relaxed line-clamp-2",
                                                    !notif.isRead ? "text-zinc-600" : "text-zinc-400"
                                                )}>
                                                    {notif.message}
                                                </p>
                                                <span className="text-[10px] text-zinc-400 font-medium mt-2 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>

                                            {/* Action Button (Mobile Friendly) */}
                                            {!notif.isRead && (
                                                <div className="absolute top-4 right-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 transition-colors"
                                                        onClick={(e) => handleMarkAsRead(e, notif.id)}
                                                    >
                                                        <Check className="w-4 h-4" strokeWidth={3} />
                                                        <span className="sr-only">Mark read</span>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
        );
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <button className="relative p-3 rounded-full bg-white text-zinc-600 shadow-sm border border-zinc-100 hover:bg-zinc-50 active:scale-95 transition-all outline-none">
                    <Bell className="w-5 h-5" strokeWidth={2} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-3 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse"></span>
                    )}
                </button>
            </DrawerTrigger>

            <DrawerContent className="rounded-t-[32px]">
                {/* Header Section */}
                <div className="bg-white px-6 pt-8 pb-4 border-b border-zinc-100 shrink-0">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <DrawerTitle className="text-2xl font-bold text-zinc-900 tracking-tight">Notifications</DrawerTitle>
                            <DrawerDescription className="text-zinc-500 font-medium mt-1">
                                Stay updated with your gym activity
                            </DrawerDescription>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAllReadMutation.mutate()}
                                className="rounded-full h-9 px-4 text-xs font-bold text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100 hover:text-indigo-700"
                            >
                                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                                Mark all
                            </Button>
                        )}
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full h-12 rounded-2xl bg-zinc-100/80 p-1 grid grid-cols-2">
                            <TabsTrigger
                                value="all"
                                className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                            >
                                All Messages
                                <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-zinc-200 text-zinc-600 group-data-[state=active]:bg-zinc-100">
                                    {notifications.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="unread"
                                className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                            >
                                Unread Only
                                {unreadCount > 0 && (
                                    <Badge className="ml-2 h-5 px-1.5 bg-rose-500 text-white border-0">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="flex-1 bg-transparent">
                    {/* The TabsContent is handled manually via state to prevent re-mounting the ScrollArea context awkwardly */}
                    <div className="min-h-full">
                        {activeTab === 'all' ? (
                            <NotificationList groups={groupedAll} isEmpty={notifications.length === 0} />
                        ) : (
                            <NotificationList groups={groupedUnread} isEmpty={unreadNotifications.length === 0} />
                        )}
                    </div>
                </ScrollArea>


            </DrawerContent>
        </Drawer>
    );
}