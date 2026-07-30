import clsx from "clsx";

const colorMap: Record<string, string> = {
  stable: "bg-green-100 text-green-800",
  recovering: "bg-blue-100 text-blue-800",
  critical: "bg-red-100 text-red-800",
  chronic: "bg-yellow-100 text-yellow-800",
  discharged: "bg-gray-100 text-gray-700",
  "under observation": "bg-purple-100 text-purple-800",
  male: "bg-sky-100 text-sky-800",
  female: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-700",
};

interface BadgeProps {
  label: string;
  className?: string;
}

export default function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        colorMap[label.toLowerCase()] ?? "bg-gray-100 text-gray-700",
        className
      )}
    >
      {label}
    </span>
  );
}
