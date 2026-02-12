import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Admin = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  // Add other admin properties
};

type AuthStore = {
  token: string | null;
  user: Admin | null;
  setUser: (user: Admin | null) => void;
  setToken: (token: string | null) => void;
  clearAuth: () => void;
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;