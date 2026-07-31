"use client";
import { useEffect, useState } from "react";
import { Stethoscope, Users, TrendingUp, Activity } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { dashboardApi } from "@/lib/api";
import { DashboardStats } from "@/types";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend
);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CONDITION_COLORS = ["#3b82f6","#ef4444","#22c55e","#f59e0b","#8b5cf6","#06b6d4"];

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
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!stats) return null;

  const monthlyData = {
    labels: stats.monthlyPatients.map((m) => `${MONTHS[m.month - 1]} ${m.year}`),
    datasets: [{
      label: "New Patients",
      data: stats.monthlyPatients.map((m) => m.count),
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59,130,246,0.1)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#3b82f6",
      pointRadius: 5,
    }],
  };

  const conditionData = {
    labels: stats.conditionBreakdown.map((c) => c.condition),
    datasets: [{
      data: stats.conditionBreakdown.map((c) => c.count),
      backgroundColor: CONDITION_COLORS,
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const topDoctorsData = {
    labels: stats.patientsPerDoctor.map((d) => d.doctorName),
    datasets: [{
      label: "Patients",
      data: stats.patientsPerDoctor.map((d) => d.patientCount),
      backgroundColor: "rgba(99,102,241,0.8)",
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOpts = { responsive: true, plugins: { legend: { display: false } }, maintainAspectRatio: false };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Doctors"  value={stats.totals.doctors}  icon={Stethoscope} color="blue"   subtitle="Registered doctors" />
          <StatCard title="Total Patients" value={stats.totals.patients} icon={Users}       color="green"  subtitle="All patients" />
          <StatCard
            title="Avg Patients / Doctor"
            value={stats.totals.doctors ? (stats.totals.patients / stats.totals.doctors).toFixed(1) : 0}
            icon={Activity} color="purple"
          />
          <StatCard
            title="Top Specializations"
            value={stats.topSpecializations[0]?.specialization ?? "—"}
            icon={TrendingUp} color="orange"
            subtitle={`${stats.topSpecializations[0]?.count ?? 0} doctors`}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Monthly Patients (Last 12 Months)</h3>
            <div className="h-64">
              <Line data={monthlyData} options={chartOpts} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Patient Conditions</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={conditionData} options={{ ...chartOpts, plugins: { legend: { display: true, position: "bottom" } } }} />
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Top Doctors by Patients</h3>
            <div className="h-64">
              <Bar data={topDoctorsData} options={chartOpts} />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Top Specializations</h3>
            <div className="space-y-3 mt-2">
              {stats.topSpecializations.map((s, i) => (
                <div key={s.specialization} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{s.specialization}</span>
                      <span className="text-gray-500">{s.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(s.count / (stats.topSpecializations[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
