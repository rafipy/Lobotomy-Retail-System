"use client";

import { Package, Users, TrendingUp, AlertTriangle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  borderColor: string;
  valueColor: string;
  iconColor: string;
}

function StatCard({
  title,
  value,
  icon,
  borderColor,
  valueColor,
  iconColor,
}: StatCardProps) {
  return (
    <div
      className={`bg-black/60 border-2 ${borderColor} rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 font-body text-sm">{title}</p>
          <p className={`text-3xl font-bold ${valueColor} mt-2`}>{value}</p>
        </div>
        <div className={iconColor}>{icon}</div>
      </div>
    </div>
  );
}

export function StatsCards() {
  const stats = [
    {
      title: "Total Items",
      value: 247,
      icon: <Package className="h-12 w-12" />,
      borderColor: "border-teal-500",
      valueColor: "text-teal-300",
      iconColor: "text-teal-500",
    },
    {
      title: "Low Stock Items",
      value: 12,
      icon: <AlertTriangle className="h-12 w-12" />,
      borderColor: "border-yellow-500",
      valueColor: "text-yellow-400",
      iconColor: "text-yellow-500",
    },
    {
      title: "Total Employees",
      value: 156,
      icon: <Users className="h-12 w-12" />,
      borderColor: "border-blue-500",
      valueColor: "text-blue-300",
      iconColor: "text-blue-500",
    },
    {
      title: "Monthly Revenue",
      value: "$45.2K",
      icon: <TrendingUp className="h-12 w-12" />,
      borderColor: "border-green-500",
      valueColor: "text-green-300",
      iconColor: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          borderColor={stat.borderColor}
          valueColor={stat.valueColor}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  );
}
