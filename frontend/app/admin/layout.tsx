"use client";

import { useState } from "react";
import { getAuthData } from "@/lib/auth";
import { Header } from "@/app/components/layout/header";
import { Sidebar } from "@/app/components/layout/sidebar";
import { usePathname } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [username] = useState<string>(() => {
    const authData = getAuthData();
    return authData?.username || "";
  });

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-black to-red-950">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="w-full">
        <Header
          username={username}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Page content goes here */}
        <main className="w-full">{children}</main>
      </div>
    </div>
  );
}
