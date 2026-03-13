"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TeamLeadTable from "@/components/teamleads/TeamLeadTable";
import AddTeamLeadModal from "@/components/teamleads/AddTeamLeadModal";
import Pagination from "@/components/common/Pagination";
import UserDetailsModal from "@/components/common/UserDetailsModal";
import { userService } from "@/services/user.service";
import {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  PaginationMeta,
} from "@/types/user";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";

export default function TeamLeadsPage() {
  const { user: currentUser } = useAuth();
  const [teamLeads, setTeamLeads] = useState<User[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const itemsPerPage = 10;

  const fetchTeamLeads = async (page: number = 1) => {
    try {
      setLoading(true);
      const [{ data: res }, { data: allUsersRes }] = await Promise.all([
        userService.getAll({
          page,
          limit: itemsPerPage,
        }),
        userService.getAll({
          page: 1,
          limit: currentUser?.role === "admin" ? 5000 : 1000,
        }),
      ]);
      const filteredTeamLeads = (res.data ?? []).filter(
        (u) => u.role === "team_lead",
      );
      setTeamLeads(filteredTeamLeads);

      const users = allUsersRes.data ?? [];
      const counts: Record<string, number> = {};
      for (const lead of filteredTeamLeads) {
        counts[lead._id] = 0;
      }

      for (const u of users) {
        if (!u.teamLeadId) continue;
        if (counts[u.teamLeadId] !== undefined) {
          counts[u.teamLeadId] += 1;
        }
      }
      setMemberCounts(counts);

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch {
      toast.error("Failed to load team leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamLeads(currentPage);
  }, [currentPage, currentUser?.role]);

  const handleAddTeamLead = async (data: Omit<CreateUserPayload, "role">) => {
    try {
      await userService.create({ ...data, role: "team_lead" });
      toast.success("Team Lead created successfully");
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchTeamLeads(1);
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        errors?: string[];
      }>;
      const msg =
        axiosError.response?.data?.errors?.[0] ||
        axiosError.response?.data?.message ||
        "Failed to create team lead";
      toast.error(msg);
    }
  };

  const handleEditTeamLead = (teamLead: User) => {
    setEditingUser(teamLead);
    setIsModalOpen(true);
  };

  const handleViewTeamLead = (teamLead: User) => {
    setViewingUser(teamLead);
  };

  const handleSaveTeamLead = async (data: Omit<CreateUserPayload, "role">) => {
    if (!editingUser) return;
    try {
      const payload: UpdateUserPayload = {
        email: data.email,
        username: data.username,
        address: data.address,
        managerId: data.managerId,
      };
      await userService.update(editingUser._id, payload);
      toast.success("Team Lead updated successfully");
      setIsModalOpen(false);
      setEditingUser(null);
      fetchTeamLeads(currentPage);
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        errors?: string[];
      }>;
      const msg =
        axiosError.response?.data?.errors?.[0] ||
        axiosError.response?.data?.message ||
        "Failed to update team lead";
      toast.error(msg);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team Leads</h1>
          <p className="mt-1 text-sm text-gray-500">Manage team leaders</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          Add Team Lead
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Loading team leads…</span>
        </div>
      ) : (
        <>
          <TeamLeadTable
            teamLeads={teamLeads}
            memberCounts={memberCounts}
            onEdit={handleEditTeamLead}
            onView={handleViewTeamLead}
          />
          {pagination && (
            <div className="mt-4">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      <AddTeamLeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleSaveTeamLead : handleAddTeamLead}
        editUser={editingUser}
      />

      <UserDetailsModal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
      />
    </DashboardLayout>
  );
}
