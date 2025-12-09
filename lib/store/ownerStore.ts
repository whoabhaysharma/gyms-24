import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gymsAPI } from '../api/client';

interface Gym {
    id: string;
    name: string;
    address?: string;
    verified: boolean;
    ownerId: string;
    ownerName?: string;
    createdAt: string;
    updatedAt: string;
}

interface OwnerStore {
    gyms: Gym[];
    currentGym: Gym | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchGyms: () => Promise<void>;
    setCurrentGym: (gymId: string) => void;
    updateGym: (gymId: string, data: Partial<Gym>) => void;
}

export const useOwnerStore = create<OwnerStore>()(
    persist(
        (set, get) => ({
            gyms: [],
            currentGym: null,
            isLoading: false,
            error: null,

            fetchGyms: async () => {
                set({ isLoading: true, error: null });
                try {
                    const res = await gymsAPI.getMyOwned();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const gyms = (res.data.data || res.data).map((gym: any) => ({
                        ...gym,
                        ownerName: gym.owner?.name
                    }));

                    set({
                        gyms,
                        // If no current gym is selected, select the first one by default
                        currentGym: get().currentGym || (gyms.length > 0 ? gyms[0] : null),
                        isLoading: false
                    });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    console.error('Failed to fetch gyms:', error);
                    set({
                        error: error.message || 'Failed to fetch gyms',
                        isLoading: false
                    });
                }
            },

            setCurrentGym: (gymId: string) => {
                const gym = get().gyms.find(g => g.id === gymId);
                if (gym) {
                    set({ currentGym: gym });
                }
            },

            updateGym: (gymId: string, data: Partial<Gym>) => {
                set(state => {
                    const updatedGyms = state.gyms.map(g =>
                        g.id === gymId ? { ...g, ...data } : g
                    );

                    // Also update currentGym if it matches
                    const updatedCurrentGym = state.currentGym?.id === gymId
                        ? { ...state.currentGym, ...data }
                        : state.currentGym;

                    return {
                        gyms: updatedGyms,
                        currentGym: updatedCurrentGym
                    };
                });
            }
        }),
        {
            name: 'owner-storage', // unique name for localStorage
            partialize: (state) => ({
                gyms: state.gyms,
                currentGym: state.currentGym
            }), // Only persist data, not loading/error states
        }
    )
);
