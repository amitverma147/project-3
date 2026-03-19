"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeTable from "@/components/employees/EmployeeTable";
import AddEmployeeModal from "@/components/employees/AddEmployeeModal";
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
import { isUnauthorizedError } from "@/lib/apiError";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const itemsPerPage = 10;

  const fetchEmployees = async (page: number = 1) => {
    try {
      setLoading(true);
      const { data: res } = await userService.getAll({
        page,
        limit: itemsPerPage,
      });
      const filteredEmployees = (res.data ?? []).filter(
        (u) => u.role === "employee",
      );
      setEmployees(filteredEmployees);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      if (!isUnauthorizedError(err)) {
        toast.error("Failed to load employees");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(currentPage);
  }, [currentPage]);

  const handleAddEmployee = async (data: Omit<CreateUserPayload, "role">) => {
    try {
      await userService.create({ ...data, role: "employee" });
      toast.success("Employee created successfully");
      setIsModalOpen(false);
      setCurrentPage(1);
      fetchEmployees(1);
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        errors?: string[];
      }>;
      const msg =
        axiosError.response?.data?.errors?.[0] ||
        axiosError.response?.data?.message ||
        "Failed to create employee";
      toast.error(msg);
    }
  };

  const handleEditEmployee = (emp: User) => {
    setEditingUser(emp);
    setIsModalOpen(true);
  };

  const handleViewEmployee = (emp: User) => {
    setViewingUser(emp);
  };

  const handleSaveEmployee = async (data: Omit<CreateUserPayload, "role">) => {
    if (!editingUser) return;
    try {
      const payload: UpdateUserPayload = {
        email: data.email,
        username: data.username,
        address: data.address,
        teamLeadId: data.teamLeadId,
      };
      await userService.update(editingUser._id, payload);
      toast.success("Employee updated successfully");
      setIsModalOpen(false);
      setEditingUser(null);
      fetchEmployees(currentPage);
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        errors?: string[];
      }>;
      const msg =
        axiosError.response?.data?.errors?.[0] ||
        axiosError.response?.data?.message ||
        "Failed to update employee";
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
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">Manage employees</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
        >
          Add Employee
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Loading employees…</span>
        </div>
      ) : (
        <>
          <EmployeeTable
            employees={employees}
            onEdit={handleEditEmployee}
            onView={handleViewEmployee}
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

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={editingUser ? handleSaveEmployee : handleAddEmployee}
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
