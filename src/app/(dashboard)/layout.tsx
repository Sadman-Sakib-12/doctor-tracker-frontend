"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for zustand to rehydrate from localStorage before checking auth
    if (!_hasHydrated) return;
    if (!isAuthenticated && !token) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, token, router]);

  // Still hydrating — show a full-screen loader instead of redirecting
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Hydrated but not authenticated — return null while redirect fires
  if (!isAuthenticated && !token) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {children}
      </main>
    </div>
  );
}
