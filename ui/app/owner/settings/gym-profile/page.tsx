'use client'

import { useState, useEffect } from "react"
import {
    Store,
    MapPin,
    CheckCircle2,
    ChevronLeft,
    Save,
    Upload,
    Share2,
    ShieldCheck,
    AlertCircle,
    User,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { gymsAPI } from "@/lib/api/client"
import { useOwnerStore } from "@/lib/store/ownerStore"

// SHADCN / UI Imports
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ---------------------------------------
// Types (Based on Prisma Schema)
// ---------------------------------------
interface GymProfile {
    id: string
    name: string
    address: string
    ownerName: string // Derived from owner relation
    isVerified: boolean
    createdAt: string
}

// ---------------------------------------
// Main Page Component
// ---------------------------------------
export default function GymProfilePage() {
    const { currentGym, updateGym } = useOwnerStore()
    const [gym, setGym] = useState<GymProfile | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<GymProfile | null>(null)

    useEffect(() => {
        if (currentGym) {
            const profileData: GymProfile = {
                id: currentGym.id,
                name: currentGym.name,
                address: currentGym.address || "",
                ownerName: "You", // Since this is the owner view
                isVerified: currentGym.verified,
                createdAt: currentGym.createdAt
            }
            setGym(profileData)
            setFormData(profileData)
        }
    }, [currentGym])

    const handleSave = async () => {
        if (!formData || !gym) return

        try {
            const res = await gymsAPI.update(gym.id, {
                name: formData.name,
                address: formData.address
            })

            const updatedGym = res.data.data || res.data

            // Update local state
            setGym(formData)
            setIsEditing(false)

            // Update store
            updateGym(gym.id, {
                name: updatedGym.name,
                address: updatedGym.address
            })

            toast.success("Gym profile updated successfully")
        } catch (error) {
            console.error("Failed to update profile:", error)
            toast.error("Failed to update profile")
        }
    }

    if (!currentGym) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (!gym || !formData) return null

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-28">

            {/* --- UNIFIED HEADER --- */}
            <div className="bg-white rounded-b-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border-b border-zinc-100 px-5 pt-8 pb-6 space-y-5">

                {/* Title Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8 text-zinc-400 hover:text-zinc-900">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Gym Profile</h1>
                    </div>

                    {/* Share / Public View Action */}
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-200 text-zinc-500">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Gym Identity Card (Hero) */}
                <div className="flex items-start gap-4">
                    {/* Logo / Placeholder */}
                    <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200 flex-shrink-0">
                        <Store className="w-8 h-8" />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold text-zinc-900 truncate leading-none">
                                {gym.name}
                            </h2>
                            {gym.isVerified && (
                                <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-50" />
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 font-medium">
                            ID: <span className="font-mono text-zinc-500">{gym.id}</span>
                        </p>

                        <div className="mt-2 flex gap-2">
                            {gym.isVerified ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] h-5 px-2 font-bold gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Verified Gym
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] h-5 px-2 font-bold gap-1">
                                    <AlertCircle className="w-3 h-3" /> Unverified
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="px-4 py-6 space-y-6">

                {/* Section 1: General Info */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">General Information</h3>
                        <Button
                            variant="link"
                            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                            className="h-auto p-0 text-xs font-bold text-zinc-900"
                        >
                            {isEditing ? 'Cancel' : 'Edit Details'}
                        </Button>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-5">

                        {/* Name Input */}
                        <div className="space-y-2">
                            <Label className="text-zinc-500 text-xs font-bold uppercase">Gym Name</Label>
                            {isEditing ? (
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-11 rounded-xl bg-zinc-50 border-zinc-200 font-semibold text-zinc-900"
                                />
                            ) : (
                                <p className="text-base font-bold text-zinc-900">{gym.name}</p>
                            )}
                        </div>

                        {/* Address Input */}
                        <div className="space-y-2">
                            <Label className="text-zinc-500 text-xs font-bold uppercase flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Address
                            </Label>
                            {isEditing ? (
                                <Textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="min-h-[80px] rounded-xl bg-zinc-50 border-zinc-200 font-medium text-zinc-900 text-sm resize-none"
                                />
                            ) : (
                                <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                                    {gym.address || "No address provided."}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: Owner Info (Read Only Relation) */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">Owner Details</h3>
                    <div className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-zinc-100 bg-zinc-50">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${gym.ownerName}`} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-500 font-bold">CN</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-bold text-zinc-900">{gym.ownerName}</p>
                            <p className="text-xs text-zinc-400 font-medium mt-0.5">Primary Administrator</p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto text-zinc-400 hover:text-zinc-900">
                            View
                        </Button>
                    </div>
                </div>

                {/* Section 3: Verification (If unverified) */}
                {!gym.isVerified && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border border-amber-100 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded-xl text-amber-500 shadow-sm">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Verify your Gym</h4>
                                <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                                    Verified gyms appear higher in search results and gain trust badges.
                                </p>
                            </div>
                        </div>
                        <Button className="w-full bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 shadow-sm font-bold text-xs h-10 rounded-xl">
                            Request Verification
                        </Button>
                    </div>
                )}

            </div>

            {/* Sticky Save Action (Only visible when editing) */}
            {isEditing && (
                <div className="fixed bottom-6 left-4 right-4 z-40">
                    <Button
                        onClick={handleSave}
                        className="w-full h-14 bg-zinc-900 text-white rounded-2xl shadow-xl shadow-zinc-900/20 font-bold text-base flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all"
                    >
                        <Save className="w-5 h-5" /> Save Changes
                    </Button>
                </div>
            )}
        </div>
    )
}