'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { gymsAPI } from '@/lib/api/client';
import { Loader2, MapPin, Star, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Gym {
  id: string;
  name: string;
  address?: string;
  // Add other fields if available, e.g., rating, image
}

export default function ExplorePage() {
  const router = useRouter();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const res = await gymsAPI.getAll();
        // Handle nested data structure: res.data (axios) -> data (api wrapper) -> data (pagination)
        const responseData = res.data;
        if (responseData.data && Array.isArray(responseData.data.data)) {
          setGyms(responseData.data.data);
        } else if (Array.isArray(responseData.data)) {
          setGyms(responseData.data);
        } else {
          setGyms([]);
        }
      } catch (error) {
        console.error("Failed to fetch gyms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Explore Gyms</h1>
          <p className="mt-1 text-sm text-zinc-500 font-medium">Find the perfect place to workout</p>
        </div>

        {/* Gym List */}
        <div className="space-y-4">
          {gyms.length > 0 ? (
            gyms.map((gym) => (
              <div
                key={gym.id}
                className="group bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/user/gyms/${gym.id}`)}
              >
                {/* Image Placeholder (since we don't have real images yet) */}
                <div className="h-32 bg-zinc-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-bold text-4xl opacity-20">
                    GYM
                  </div>
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                    <span className="text-xs font-bold text-zinc-800">4.8</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="font-bold text-zinc-900 text-lg leading-tight">{gym.name}</h2>
                      <p className="text-xs text-zinc-500 font-medium flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {gym.address || 'Unknown Location'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-6 w-6 rounded-full bg-zinc-200 border-2 border-white"></div>
                      ))}
                      <div className="h-6 w-6 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-zinc-500">+12</div>
                    </div>
                    <Button
                      size="sm"
                      className="rounded-xl px-4 h-9 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-400 font-medium">No gyms found nearby.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
