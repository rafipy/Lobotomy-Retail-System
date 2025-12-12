"use client";

import { useState } from "react";
import { getAuthData } from "@/lib/auth";
import { AdminHeader } from "@/app/components/layout/admin-header";
import { AdminSidebar } from "@/app/components/layout/admin-sidebar";
import { usePathname } from "next/navigation";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [username] = useState<string>(() => {
    const authData = getAuthData();
    return authData?.username || "";
  });

  if (pathname === "/customer") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-teal-950">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="w-full">
        <AdminHeader
          username={username}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Page content goes here */}
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}
