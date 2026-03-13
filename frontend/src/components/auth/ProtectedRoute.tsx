"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/user";
import { hasRouteAccess, getRedirectPath } from "@/lib/roleUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (!loading && user && allowedRoles) {
      if (!allowedRoles.includes(user.role)) {
        const redirectPath = getRedirectPath(user.role);
        router.replace(redirectPath);
        return;
      }
    }

    // Check route-level access based on pathname
    if (!loading && user && !hasRouteAccess(user.role, pathname)) {
      const redirectPath = getRedirectPath(user.role);
      router.replace(redirectPath);
    }
  }, [loading, user, router, allowedRoles, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
