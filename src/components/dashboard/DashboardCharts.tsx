"use client";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { DashboardStats } from "@/types";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const CONDITION_COLORS = ["#3b82f6","#ef4444","#22c55e","#f59e0b","#8b5cf6","#06b6d4"];
const baseOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

interface Props {
  stats: DashboardStats;
  months: string[];
}

export default function DashboardCharts({ stats, months }: Props) {
  const monthlyData = {
    labels: stats.monthlyPatients.map((m) => `${months[m.month - 1]} ${m.year}`),
    datasets: [{
      label: "New Patients",
      data: stats.monthlyPatients.map((m) => m.count),
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59,130,246,0.1)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#3b82f6",
      pointRadius: 4,
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

  return (
    <>
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Patients (Last 12 Months)</h3>
          <div className="h-64">
            <Line data={monthlyData} options={baseOpts} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Patient Conditions</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={conditionData}
              options={{ ...baseOpts, plugins: { legend: { display: true, position: "bottom" } } }}
            />
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top Doctors by Patients</h3>
          <div className="h-64">
            <Bar data={topDoctorsData} options={baseOpts} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top Specializations</h3>
          <div className="space-y-3 mt-2">
            {stats.topSpecializations.map((s, i) => (
              <div key={s.specialization} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{s.specialization}</span>
                    <span className="text-gray-500">{s.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(s.count / (stats.topSpecializations[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
