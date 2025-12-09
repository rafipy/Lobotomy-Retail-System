"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  User,
  AlertCircle,
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

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Inventory",
      href: "/admin/inventory",
      icon: <Package className="h-5 w-5" />,
    },

    {
      name: "Orders",
      href: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },

    {
      name: "Customers",
      href: "/admin/customers",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-black/95 border-r-4 border-red-500 z-50
          shadow-2xl shadow-red-500/50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b-2 border-red-500">
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
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-teal-200 hover:bg-red-900/50 hover:text-white"
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
                      ? "bg-red-700 text-white border-2 border-teal-400 shadow-lg shadow-red-500/50"
                      : "text-gray-300 hover:bg-red-900/50 hover:text-teal-200 border-2 border-transparent"
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

          <Separator className="my-4 bg-red-500/30" />

          {!isCollapsed && (
            <div className="mt-6 p-4 bg-red-950/50 border-2 border-red-600 rounded-lg">
              <p className="text-xs text-red-400 font-body leading-relaxed">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                To protect against memetic hazards, abnormalities, or
                corporation espionage, please remember to log out of your
                account when business has concluded.
              </p>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
