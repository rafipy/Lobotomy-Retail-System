"use client";

import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  username: string;
  onMenuClick: () => void;
}

export function Header({ username, onMenuClick }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/admin");
  };

  return (
    <header className="border-b-4 border-red-500 bg-black/80 backdrop-blur-sm sticky top-0 z-30 w-full animate-fade-in">
      <div className="w-full px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="text-teal-200 hover:bg-transparent border-2 hover:text-white border-teal-500/50 hover:border-teal-400"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-teal-200">
                L. CORP Admin Dashboard
              </h1>
              <p className="text-gray-400 font-body mt-1">
                Welcome back,{" "}
                <span className="text-teal-400 font-semibold">{username}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-700 hover:bg-red-900 text-white font-bold"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
