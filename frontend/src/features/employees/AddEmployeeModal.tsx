"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import EmployeeForm from "@/features/employees/EmployeeForm";
import { type EmployeeFormValues } from "@/features/employees/employee.schema";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { type User } from "@/types/user";
import { toast } from "sonner";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues) => Promise<void> | void;
  defaultValues?: Partial<EmployeeFormValues>;
  title?: string;
  isEdit?: boolean;
  submitLabel?: string;
}

const ensureMobileWithCountryCode = (mobileNumber: string) => {
  const normalized = mobileNumber.trim();
  return normalized.startsWith("+91") ? normalized : `+91${normalized}`;
};

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  title = "Add Employee",
  isEdit = false,
  submitLabel,
}: AddEmployeeModalProps) {
  const { user: currentUser } = useAuth();
  const isManagerRole = currentUser?.role === "manager";
  const isTeamLeadRole = currentUser?.role === "team_lead";
  const [teamLeads, setTeamLeads] = useState<User[]>([]);
  const [loadingTeamLeads, setLoadingTeamLeads] = useState(false);

  const fetchTeamLeads = useCallback(async () => {
    try {
      setLoadingTeamLeads(true);
      let filteredTeamLeads: User[] = [];

      if (isManagerRole && currentUser?._id) {
        const { data: res } = await userService.getTeamLeadsByManager(
          currentUser._id,
        );
        filteredTeamLeads = res.data ?? [];
      } else {
        const { data: res } = await userService.getAll();
        filteredTeamLeads = (res.data ?? []).filter(
          (u) => u.role === "team_lead" && u.status === "active",
        );
      }

      setTeamLeads(filteredTeamLeads);
    } catch {
      toast.error("Failed to fetch team leads");
    } finally {
      setLoadingTeamLeads(false);
    }
  }, [isManagerRole, currentUser?._id]);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || isTeamLeadRole) return;
    void fetchTeamLeads();
  }, [isOpen, isTeamLeadRole, fetchTeamLeads]);

  const teamLeadOptions = useMemo(
    () =>
      teamLeads.map((lead) => ({
        value: lead._id,
        label:
          `${lead.firstName || lead.fname || ""} ${lead.lastName || lead.lname || ""}`.trim(),
      })),
    [teamLeads],
  );

  const mergedDefaults: Partial<EmployeeFormValues> = {
    ...defaultValues,
    teamLeadId: isTeamLeadRole
      ? (currentUser?._id ?? "")
      : (defaultValues?.teamLeadId ?? ""),
  };

  if (!isOpen) return null;

  const handleSubmit = async (values: EmployeeFormValues) => {
    await onSubmit({
      ...values,
      mobileNumber: ensureMobileWithCountryCode(values.mobileNumber),
      teamLeadId: isTeamLeadRole ? (currentUser?._id ?? "") : values.teamLeadId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg relative z-10 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-modal-title"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2
            id="employee-modal-title"
            className="text-lg font-medium text-gray-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-xl font-bold"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <EmployeeForm
            defaultValues={mergedDefaults}
            submitLabel={
              submitLabel ?? (isEdit ? "Save Changes" : "Create Employee")
            }
            isEdit={isEdit}
            isTeamLeadRole={isTeamLeadRole}
            teamLeadOptions={teamLeadOptions}
            loadingTeamLeads={loadingTeamLeads}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
