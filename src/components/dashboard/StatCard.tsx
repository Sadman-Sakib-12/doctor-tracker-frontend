import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: "blue" | "green" | "purple" | "orange";
  subtitle?: string;
}

const colors = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-500",   text: "text-blue-600" },
  green:  { bg: "bg-green-50",  icon: "bg-green-500",  text: "text-green-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-500", text: "text-purple-600" },
  orange: { bg: "bg-orange-50", icon: "bg-orange-500", text: "text-orange-600" },
};

export default function StatCard({ title, value, icon: Icon, color = "blue", subtitle }: StatCardProps) {
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={clsx("text-3xl font-bold mt-1", c.text)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", c.icon)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
