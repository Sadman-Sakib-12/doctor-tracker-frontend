"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Stethoscope, Users, TrendingUp, Activity } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { DashboardStats } from "@/types";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";

// Lazy load chart components so they don't block initial page render
const DashboardCharts = dynamic(() => import("@/components/dashboard/DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-80 animate-pulse ${i === 1 ? "lg:col-span-2" : ""}`} />
      ))}
    </div>
  ),
});

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getStats()
      .then((r) => setStats(r.data.data))
      .catch((e) => {
        console.error(e);
        setError("Failed to load dashboard data. Is the backend running?");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <Header title="Dashboard" />
        <div className="flex-1 p-6 space-y-6">
          {/* Skeleton stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1,2].map(i => (
              <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-80 animate-pulse ${i === 1 ? "lg:col-span-2" : ""}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <Header title="Dashboard" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">⚠️</div>
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); dashboardApi.getStats().then((r) => setStats(r.data.data)).catch((e) => setError(e.message)).finally(() => setLoading(false)); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">

        {/* Stat cards — render immediately, no chart dep */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Doctors"  value={stats.totals.doctors}  icon={Stethoscope} color="blue"   subtitle="Registered doctors" />
          <StatCard title="Total Patients" value={stats.totals.patients} icon={Users}       color="green"  subtitle="All patients" />
          <StatCard
            title="Avg Patients / Doctor"
            value={stats.totals.doctors ? (stats.totals.patients / stats.totals.doctors).toFixed(1) : 0}
            icon={Activity} color="purple"
          />
          <StatCard
            title="Top Specialization"
            value={stats.topSpecializations[0]?.specialization ?? "—"}
            icon={TrendingUp} color="orange"
            subtitle={`${stats.topSpecializations[0]?.count ?? 0} doctors`}
          />
        </div>

        {/* Charts — lazy loaded */}
        <DashboardCharts stats={stats} months={MONTHS} />

      </div>
    </div>
  );
}
