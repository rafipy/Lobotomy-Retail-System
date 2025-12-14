"use client";

import { useState } from "react";
import { getAuthData } from "@/lib/auth";
import { CustomerHeader } from "@/app/components/dashboard/customer-home";
import { CartProvider } from "@/app/components/dashboard/cart";
import { CustomerSidebar } from "@/app/components/layout/customer-sidebar";
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
    <CartProvider>
      <div className="min-h-screen bg-linear-to-b from-black to-teal-950">
        <CustomerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
 
        <div className="w-full">
          <CustomerHeader
            username={username}
            onMenuClick={() => setIsSidebarOpen(true)}
          />
 
          {/* Page content goes here */}
          <main className="w-full">{children}</main>
        </div>
      </div>
    </CartProvider>
  );
}
