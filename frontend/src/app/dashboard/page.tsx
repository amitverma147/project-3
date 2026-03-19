"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentUsersTable from "@/components/dashboard/RecentUsersTable";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { isUnauthorizedError } from "@/lib/apiError";

export default function DashboardPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    managers: 0,
    teamLeads: 0,
    employees: 0,
    recentJoined: 0,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    // Redirect employees to profile page
    if (currentUser?.role === "employee") {
      router.replace("/profile");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data: res } = await userService.getAll();
        const users: User[] = res.data ?? [];

        // Role-based metric calculation
        let managers = 0;
        let teamLeads = 0;
        let employees = 0;

        if (currentUser?.role === "admin") {
          managers = users.filter((u) => u.role === "manager").length;
          teamLeads = users.filter((u) => u.role === "team_lead").length;
          employees = users.filter((u) => u.role === "employee").length;
        } else if (currentUser?.role === "manager") {
          // Manager sees their team leads and employees under them
          teamLeads = users.filter((u) => u.role === "team_lead").length;
          employees = users.filter((u) => u.role === "employee").length;
        } else if (currentUser?.role === "team_lead") {
          // Team lead sees only their employees
          employees = users.filter((u) => u.role === "employee").length;
        }

        // "recently joined" = created in last 7 days
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentJoined = users.filter(
          (u) => new Date(u.createdAt).getTime() > weekAgo,
        ).length;

        setMetrics({ managers, teamLeads, employees, recentJoined });

        // Show the 5 most recently created users
        const sorted = [...users].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setRecentUsers(sorted.slice(0, 5));
      } catch (err) {
        if (!isUnauthorizedError(err)) {
          toast.error("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser, router]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {currentUser?.role === "admin" && (
            <MetricCard
              title="Total Managers"
              value={loading ? "..." : metrics.managers}
            />
          )}
          {(currentUser?.role === "admin" ||
            currentUser?.role === "manager") && (
            <MetricCard
              title="Total Team Leads"
              value={loading ? "..." : metrics.teamLeads}
            />
          )}
          <MetricCard
            title="Total Employees"
            value={loading ? "..." : metrics.employees}
          />
          <MetricCard
            title="Recently Joined"
            value={loading ? "..." : metrics.recentJoined}
          />
        </div>

        <div className="mt-2">
          {loading ? (
            <div className="h-64 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Loading recent activity…</span>
            </div>
          ) : (
            <RecentUsersTable users={recentUsers} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
