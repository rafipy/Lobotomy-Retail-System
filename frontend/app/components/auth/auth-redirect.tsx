"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getAuthData } from "@/lib/auth";

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

export function AuthRedirect({
  children,
  redirectIfAuthenticated = false,
  requiredRole,
  redirectTo = "/",
}: AuthRedirectProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Check if user should be redirected away (login page case)
      if (redirectIfAuthenticated && isAuthenticated()) {
        const authData = getAuthData();

        if (authData?.role === "admin") {
          router.push("/admin/dashboard");
        } else if (authData?.role === "customer") {
          router.push("/customer/dashboard");
        } else {
          router.push(redirectTo);
        }

        // Don't render children, redirecting
        setShouldRender(false);
      }
      // Check if user has required role (protected page case)
      else if (requiredRole) {
        const authData = getAuthData();

        if (!isAuthenticated() || authData?.role !== requiredRole) {
          router.push("/admin");
          setShouldRender(false);
        } else {
          setShouldRender(true);
        }
      } else {
        setShouldRender(true);
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [redirectIfAuthenticated, requiredRole, redirectTo, router]);

  // Show nothing while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-linear-to-b from-black to-red-950 flex items-center justify-center">
        <div className="text-teal-400 text-xl font-body animate-pulse">
          Verifying credentials...
        </div>
      </div>
    );
  }

  // Only render children if authorization check passed
  return shouldRender ? <>{children}</> : null;
}
