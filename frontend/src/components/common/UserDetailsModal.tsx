"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const detailItem = (label: string, value?: string | null) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
      {label}
    </p>
    <p className="mt-1 text-sm text-gray-900 wrap-break-word">
      {value && value.trim() ? value : "-"}
    </p>
  </div>
);

export default function UserDetailsModal({
  isOpen,
  onClose,
  user,
}: UserDetailsModalProps) {
  const { user: currentUser } = useAuth();
  const [managerInfo, setManagerInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [teamLeadInfo, setTeamLeadInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !user) return;

    let active = true;
    const canResolveRelatedUsers =
      currentUser?.role === "admin" ||
      currentUser?.role === "manager" ||
      currentUser?.role === "team_lead";
    const currentUserName = currentUser
      ? `${currentUser.firstName ?? currentUser.fname ?? ""} ${currentUser.lastName ?? currentUser.lname ?? ""}`.trim() ||
        currentUser.username ||
        currentUser._id
      : "";

    const resolveName = async (id?: string | null) => {
      if (!id) return "-";
      if (currentUser?._id && id === currentUser._id) return currentUserName;
      if (!canResolveRelatedUsers) return id;

      try {
        const { data: res } = await userService.getById(id);
        const resolved = res.data;
        if (!resolved) return id;
        const name =
          `${resolved.firstName ?? resolved.fname ?? ""} ${resolved.lastName ?? resolved.lname ?? ""}`.trim();
        return name || id;
      } catch {
        return id;
      }
    };

    const resolveNames = async () => {
      const [resolvedManagerName, resolvedTeamLeadName] = await Promise.all([
        resolveName(user.managerId),
        resolveName(user.teamLeadId),
      ]);

      if (!active) return;
      setManagerInfo(
        user.managerId
          ? { id: user.managerId, name: resolvedManagerName }
          : null,
      );
      setTeamLeadInfo(
        user.teamLeadId
          ? { id: user.teamLeadId, name: resolvedTeamLeadName }
          : null,
      );
    };

    resolveNames();

    return () => {
      active = false;
    };
  }, [isOpen, user, currentUser]);

  if (!isOpen || !user) return null;

  const fullName =
    `${user.firstName ?? user.fname ?? ""} ${user.lastName ?? user.lname ?? ""}`.trim();
  const address = user.address;
  const managerName = !user.managerId
    ? "-"
    : managerInfo?.id === user.managerId
      ? managerInfo.name
      : "Loading...";
  const teamLeadName = !user.teamLeadId
    ? "-"
    : teamLeadInfo?.id === user.teamLeadId
      ? teamLeadInfo.name
      : "Loading...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="User details"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              User Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">{fullName || "-"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            aria-label="Close details"
          >
            x
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detailItem("Email", user.email)}
            {detailItem("Username", user.username)}
            {detailItem("Role", user.role)}
            {detailItem("Employee ID", user.employeeId ?? "-")}
            {detailItem("Mobile", user.mobileNumber)}
            {detailItem("Status", user.status)}
            {detailItem("Date of Birth", formatDate(user.dob))}
            {detailItem("Created Date", formatDate(user.createdAt))}
            {detailItem("Manager", managerName)}
            {detailItem("Team Lead", teamLeadName)}
          </div>

          <div className="pt-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detailItem("House Number", address?.houseNumber)}
              {detailItem("Street", address?.street)}
              {detailItem("Country", address?.country)}
              {detailItem("State", address?.state)}
              {detailItem("City", address?.city)}
              {detailItem("Pincode", address?.pincode)}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
