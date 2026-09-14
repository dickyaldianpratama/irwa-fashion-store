import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SizeProfile {
  tinggiBadan: string;
  beratBadan: string;
  lingkarDada: string;
  lingkarPinggang: string;
  lebarBahu: string;
  panjangLengan: string;
}

interface SaveMySizeState {
  profile: SizeProfile;
  hasProfile: boolean;
  saveProfile: (profile: SizeProfile) => void;
  resetProfile: () => void;
}

const emptyProfile: SizeProfile = {
  tinggiBadan: "",
  beratBadan: "",
  lingkarDada: "",
  lingkarPinggang: "",
  lebarBahu: "",
  panjangLengan: "",
};

export const useSaveMySize = create<SaveMySizeState>()(
  persist(
    (set) => ({
      profile: emptyProfile,
      hasProfile: false,
      saveProfile: (profile) => set({ profile, hasProfile: true }),
      resetProfile: () => set({ profile: emptyProfile, hasProfile: false }),
    }),
    {
      name: "save-my-size-storage",
    }
  )
);
