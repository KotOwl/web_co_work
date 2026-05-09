import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  currency: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  isDarkMode: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  toggleDarkMode: () => void;
  logout: () => void;
}

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: getToken(),
      isDarkMode: false,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }
        set({ token });
      },
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },
    }),
    {
      name: "finance-tracker-storage",
    },
  ),
);
