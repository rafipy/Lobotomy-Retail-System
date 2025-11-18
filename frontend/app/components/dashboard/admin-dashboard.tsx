"use client";

import { useState } from "react";
import { getAuthData } from "@/lib/auth";
import { ItemGallery } from "./item-gallery";
import { StatsCards } from "./stats-cards";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

export function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [username] = useState<string>(() => {
    const authData = getAuthData();
    return authData?.username || "";
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-red-950">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="w-full">
        <DashboardHeader
          username={username}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Content */}
        <div className="w-full max-w-7xl mx-auto px-6 py-8">
          <StatsCards />
          <div className="bg-black/40 border-2 border-red-500 rounded-xl p-6 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold text-teal-200 mb-2">
                Inventory Management
              </h2>
              <p className="text-gray-400 font-body">
                Browse and manage all items in the retail system
              </p>
            </div>

            <ItemGallery />
          </div>
        </div>
      </div>
    </div>
  );
}
