"use client";

import { useState, useEffect } from "react";
import { getAuthData } from "@/lib/auth";
import { AdminHeader } from "@/app/components/layout/admin-header";
import { AdminSidebar } from "@/app/components/layout/admin-sidebar";
import { usePathname } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const authData = getAuthData();
    if (authData?.username) {
      setUsername(authData.username);
    }
  }, []);

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-red-950">
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
