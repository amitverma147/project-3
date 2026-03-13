"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ManagersTable from "@/components/managers/ManagersTable";
import AddManagerModal from "@/components/managers/AddManagerModal";
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

export default function ManagersPage() {
  const { user: currentUser } = useAuth();
  const [managers, setManagers] = useState<User[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const itemsPerPage = 10;

  const fetchManagers = async (page: number = 1) => {
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

      const filteredManagers = (res.data ?? []).filter(
        (u) => u.role === "manager",
      );
      setManagers(filteredManagers);

      const users = allUsersRes.data ?? [];
      const counts: Record<string, number> = {};
      for (const manager of filteredManagers) {
        counts[manager._id] = 0;
      }

      for (const u of users) {
        if (!u.managerId) continue;
        if (counts[u.managerId] !== undefined) {
          counts[u.managerId] += 1;
        }
      }
      setMemberCounts(counts);

      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch {
      toast.error("Failed to load managers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers(currentPage);
  }, [currentPage, currentUser?.role]);

  const handleAddManager = async (data: Omit<CreateUserPayload, "role">) => {
    try {
      await userService.create({ ...data, role: "manager" });
      toast.success("Manager created successfully");
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchManagers(1);
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        errors?: string[];
      }>;
      const msg =
        axiosError.response?.data?.errors?.[0] ||
        axiosError.response?.data?.message ||
        "Failed to create manager";
      toast.error(msg);
    }
  };

  const handleEditManager = (manager: User) => {
    setEditingUser(manager);
    setIsModalOpen(true);
  };

  const handleViewManager = (manager: User) => {
    setViewingUser(manager);
  };

  const handleSaveManager = async (data: Omit<CreateUserPayload, "role">) => {
    if (!editingUser) return;
    try {
      const payload: UpdateUserPayload = {
        email: data.email,
        username: data.username,
        address: data.address,
      };
      await userService.update(editingUser._id, payload);
      toast.success("Manager updated successfully");
      setIsModalOpen(false);
      setEditingUser(null);
      fetchManagers(currentPage);
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        errors?: string[];
      }>;
      const msg =
        axiosError.response?.data?.errors?.[0] ||
        axiosError.response?.data?.message ||
        "Failed to update manager";
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
          <h1 className="text-2xl font-semibold text-gray-900">Managers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage organisation managers
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          Add Manager
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Loading managers…</span>
        </div>
      ) : (
        <>
          <ManagersTable
            managers={managers}
            memberCounts={memberCounts}
            onEdit={handleEditManager}
            onView={handleViewManager}
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

      <AddManagerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleSaveManager : handleAddManager}
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
