"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TeamLeadForm from "@/features/teamleads/TeamLeadForm";
import { type TeamLeadFormValues } from "@/features/teamleads/teamlead.schema";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user.service";
import { type User } from "@/types/user";
import { toast } from "sonner";

interface AddTeamLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeamLeadFormValues) => Promise<void> | void;
  defaultValues?: Partial<TeamLeadFormValues>;
  title?: string;
  isEdit?: boolean;
  submitLabel?: string;
}

const ensureMobileWithCountryCode = (mobileNumber: string) => {
  const normalized = mobileNumber.trim();
  return normalized.startsWith("+91") ? normalized : `+91${normalized}`;
};

export default function AddTeamLeadModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  title = "Add Team Lead",
  isEdit = false,
  submitLabel,
}: AddTeamLeadModalProps) {
  const { user: currentUser } = useAuth();
  const isManagerRole = currentUser?.role === "manager";

  const [managers, setManagers] = useState<User[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const fetchManagers = useCallback(async () => {
    try {
      setLoadingManagers(true);
      const { data: res } = await userService.getAll();
      setManagers(
        (res.data ?? []).filter(
          (u) => u.role === "manager" && u.status === "active",
        ),
      );
    } catch {
      toast.error("Failed to fetch managers");
    } finally {
      setLoadingManagers(false);
    }
  }, []);

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
    if (!isOpen || isManagerRole) return;
    void fetchManagers();
  }, [isOpen, isManagerRole, fetchManagers]);

  const managerOptions = useMemo(
    () =>
      managers.map((manager) => ({
        value: manager._id,
        label:
          `${manager.firstName || manager.fname || ""} ${manager.lastName || manager.lname || ""}`.trim(),
      })),
    [managers],
  );

  const mergedDefaults: Partial<TeamLeadFormValues> = {
    ...defaultValues,
    managerId: isManagerRole
      ? (currentUser?._id ?? "")
      : (defaultValues?.managerId ?? ""),
  };

  if (!isOpen) return null;

  const handleSubmit = async (values: TeamLeadFormValues) => {
    await onSubmit({
      ...values,
      mobileNumber: ensureMobileWithCountryCode(values.mobileNumber),
      managerId: isManagerRole ? (currentUser?._id ?? "") : values.managerId,
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
        aria-labelledby="team-lead-modal-title"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2
            id="team-lead-modal-title"
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
          <TeamLeadForm
            defaultValues={mergedDefaults}
            submitLabel={
              submitLabel ?? (isEdit ? "Save Changes" : "Create Team Lead")
            }
            isEdit={isEdit}
            isManagerRole={isManagerRole}
            loadingManagers={loadingManagers}
            managerOptions={managerOptions}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
