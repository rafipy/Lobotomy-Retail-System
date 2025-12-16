"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  History,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      name: "Home",
      href: "/customer/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Transaction History",
      href: "/customer/transactions",
      icon: <History className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/customer/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-black/95 border-r-4 border-teal-500 z-50
          shadow-2xl shadow-teal-500/50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b-2 border-teal-500">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center animate-pulse">
                  <Image
                    src="/corp-icon.png"
                    alt="Logo"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-teal-200 text-lg">
                    L. CORP
                  </h2>
                  <p className="text-xs text-gray-400">Customer Portal</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-teal-200 hover:bg-teal-900/50 hover:text-white"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-100px)]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    active
                      ? "bg-teal-700 text-white border-2 border-teal-300 shadow-lg shadow-teal-500/50"
                      : "text-gray-300 hover:bg-teal-900/50 hover:text-teal-200 border-2 border-transparent"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <span className={active ? "text-teal-200" : ""}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-body font-semibold">{item.name}</span>
                )}
              </Link>
            );
          })}

          <Separator className="my-4 bg-teal-500/30" />

          {!isCollapsed && (
            <div className="mt-6 p-4 bg-teal-950/50 border-2 border-teal-600 rounded-lg">
              <p className="text-xs text-teal-400 font-body leading-relaxed">
                <Info className="inline h-4 w-4 mr-1" />
                Welcome to L. Corp Store! Browse our products, manage your orders, and enjoy a seamless shopping experience.
              </p>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
